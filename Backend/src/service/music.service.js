import { PassThrough } from 'stream';
import ImageKit from '@imagekit/nodejs';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import ytdlp from 'yt-dlp-exec';
import config from '../config/config.js';
import MusicModel from '../model/music.model.js';
import DownloadJobModel from '../model/downloadJob.model.js';
import normalizeYouTubeUrl from '../utils/normalizeYoutubeUrl.js';

const inFlightJobs = new Map();
let cleanupTimer = null;
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const client = new ImageKit({
    publicKey: config.imageKitPublicKey,
    privateKey: config.imageKitPrivateKey,
    urlEndpoint: config.imageKitUrlEndpoint,
});

const sanitizeFileName = (value) => (value || 'music')
    .replace(/[^a-zA-Z0-9-_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'music';

const parseMetaLine = (line) => {
    if (!line.startsWith('__META__')) {
        return null;
    }

    const data = line.replace('__META__', '').split('|||');
    return {
        title: data[0] || 'Downloaded music',
        thumbnail: data[1] || '',
        duration: Number(data[2]) || 0,
        ext: data[3] || 'm4a',
    };
};

const toStorageState = (usedBytes) => {
    if (usedBytes >= config.imageKitMaxBytes) {
        return 'full';
    }
    if ((config.imageKitMaxBytes - usedBytes) <= config.minStorageHeadroomBytes) {
        return 'near_limit';
    }
    return 'ok';
};

const getStorageUsage = async () => {
    const usage = await MusicModel.aggregate([
        {
            $match: {
                lifecycleStatus: { $in: ['ready', 'downloaded'] },
                fileSizeBytes: { $gt: 0 },
            },
        },
        {
            $group: {
                _id: null,
                totalBytes: { $sum: '$fileSizeBytes' },
            },
        },
    ]);
    return usage[0]?.totalBytes || 0;
};

const withSecondsRemaining = (expiresAt) => {
    if (!expiresAt) {
        return 0;
    }
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
};

const isMusicValid = (music) => {
    if (!music?.expiresAt || !music?.url) {
        return false;
    }
    return new Date(music.expiresAt).getTime() > Date.now() && music.lifecycleStatus !== 'deleted';
};

const runYtDlpStream = async (url) => {
    const child = ytdlp.exec(url, {
        format: 'bestaudio/best',
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: '0',
        output: '-',
        noWarnings: true,
        noPlaylist: true,
        newline: true,
        progressTemplate: 'download:__META__%(info.title)s|||%(info.thumbnail)s|||%(info.duration)s|||%(info.ext)s',
    }, {
        reject: true,
        stdin: 'ignore',
    });

    const chunks = [];
    let totalBytes = 0;
    let meta = null;
    let stderrBuffer = '';

    child.stderr?.on('data', (data) => {
        stderrBuffer += data.toString();
        const lines = stderrBuffer.split('\n');
        stderrBuffer = lines.pop() || '';
        for (const line of lines) {
            if (!meta) {
                const parsed = parseMetaLine(line.trim());
                if (parsed) {
                    meta = parsed;
                }
            }
        }
    });

    child.stdout?.on('data', (chunk) => {
        totalBytes += chunk.length;
        if (totalBytes > config.maxAudioBufferBytes) {
            child.kill('SIGTERM');
            return;
        }
        chunks.push(chunk);
    });

    await child;

    if (totalBytes > config.maxAudioBufferBytes) {
        throw new Error(`Audio exceeds max in-memory buffer of ${config.maxAudioBufferBytes} bytes`);
    }

    return {
        audioBuffer: Buffer.concat(chunks),
        meta: meta || {
            title: 'Downloaded music',
            thumbnail: '',
            duration: 0,
            ext: 'mp3',
        },
    };
};

const transcodeToMp3 = async (inputBuffer) => {
    const inputStream = new PassThrough();
    inputStream.end(inputBuffer);

    const outputChunks = [];

    await new Promise((resolve, reject) => {
        const command = ffmpeg(inputStream)
            .noVideo()
            .audioCodec('libmp3lame')
            .audioBitrate('192k')
            .format('mp3')
            .on('error', reject)
            .on('end', resolve);

        const output = command.pipe();
        output.on('data', (chunk) => outputChunks.push(chunk));
        output.on('error', reject);
    });

    return Buffer.concat(outputChunks);
};

const processDownloadJob = async (jobId) => {
    const job = await DownloadJobModel.findById(jobId);
    if (!job) {
        return;
    }

    const start = Date.now();
    const timings = { ytDlpStart: 0, streamComplete: 0, uploadComplete: 0, dbComplete: 0, total: 0 };

    try {
        job.status = 'processing';
        job.progress = 10;
        await job.save();

        timings.ytDlpStart = Date.now() - start;
        const { audioBuffer, meta } = await runYtDlpStream(job.sourceUrl);
        if ((meta.duration || 0) > config.maxDurationSeconds) {
            const error = new Error(`Duration exceeds ${config.maxDurationSeconds} seconds limit`);
            error.code = 'MAX_DURATION_EXCEEDED';
            throw error;
        }
        const mp3Buffer = await transcodeToMp3(audioBuffer);
        timings.streamComplete = Date.now() - start;

        job.progress = 60;
        await job.save();

        const safeTitle = sanitizeFileName(meta.title);
        const fileName = `${safeTitle}.mp3`;
        const uploadStream = new PassThrough();
        uploadStream.end(mp3Buffer);

        const uploadResponse = await client.files.upload({
            file: uploadStream,
            fileName,
            folder: '/yt-music',
            useUniqueFileName: true,
        });
        timings.uploadComplete = Date.now() - start;

        if (!uploadResponse?.url) {
            throw new Error('ImageKit upload failed to return URL');
        }
        if (!uploadResponse.fileId) {
            throw new Error('ImageKit upload failed to return fileId');
        }

        const expiresAt = new Date(Date.now() + config.downloadTtlMinutes * 60 * 1000);
        const result = {
            title: meta.title || 'Downloaded music',
            url: uploadResponse.url,
            downloadUrl: uploadResponse.url,
            thumbnail: meta.thumbnail || '',
            duration: meta.duration || 0,
            format: { container: 'mp3' },
            mimeType: 'audio/mpeg',
            mediaType: 'audio',
            sourceUrl: job.sourceUrl,
            fileId: uploadResponse.fileId,
            filePath: uploadResponse.filePath || '',
            fileSizeBytes: uploadResponse.size || mp3Buffer.length,
            uploadedAt: new Date(),
            expiresAt,
            secondsRemaining: withSecondsRemaining(expiresAt),
            lifecycleStatus: 'ready',
        };

        const saveMusicPromise = new MusicModel({
            ...result,
            downloadedAt: null,
        }).save();
        const updateJobPromise = DownloadJobModel.findByIdAndUpdate(jobId, {
            status: 'completed',
            progress: 100,
            result,
            expiresAt,
            errorCode: '',
            error: '',
        }, { new: true });

        await Promise.all([saveMusicPromise, updateJobPromise]);
        timings.dbComplete = Date.now() - start;
        timings.total = Date.now() - start;
        await DownloadJobModel.findByIdAndUpdate(jobId, { timings });
    } catch (error) {
        timings.total = Date.now() - start;
        await DownloadJobModel.findByIdAndUpdate(jobId, {
            status: 'failed',
            progress: 100,
            errorCode: error.code || '',
            error: error.code ? (error.message || 'Processing failed') : 'Processing failed',
            timings,
        });
        throw error;
    }
};

const queueDownloadJob = async (url) => {
    const normalizedUrl = normalizeYouTubeUrl(url);
    const activeJobs = await DownloadJobModel.countDocuments({ status: { $in: ['queued', 'processing'] } });
    if (activeJobs >= config.maxActiveJobs) {
        const error = new Error('Too many active jobs. Please retry shortly.');
        error.code = 'TOO_MANY_ACTIVE_JOBS';
        throw error;
    }

    const usedBytes = await getStorageUsage();
    const storageState = toStorageState(usedBytes);
    if (storageState === 'full') {
        const error = new Error('Storage is full. Please wait for cleanup or delete old files.');
        error.code = 'STORAGE_FULL';
        throw error;
    }

    const existingJob = await DownloadJobModel.findOne({
        sourceUrl: normalizedUrl,
        status: { $in: ['queued', 'processing'] },
    }).sort({ createdAt: -1 }).lean();

    if (existingJob) {
        return existingJob;
    }

    const job = await DownloadJobModel.create({
        sourceUrl: normalizedUrl,
        status: 'queued',
        progress: 0,
        storageState,
    });

    if (!inFlightJobs.has(normalizedUrl)) {
        const runningTask = processDownloadJob(job._id)
            .catch(() => {})
            .finally(() => {
                inFlightJobs.delete(normalizedUrl);
            });
        inFlightJobs.set(normalizedUrl, runningTask);
    }

    return job.toObject();
};

const getCachedMusicBySourceUrl = async (sourceUrl) => {
    const normalizedUrl = normalizeYouTubeUrl(sourceUrl);
    const music = await MusicModel.findOne({ sourceUrl: normalizedUrl }).sort({ createdAt: -1 }).lean();
    if (!music || !isMusicValid(music)) {
        return null;
    }

    return {
        ...music,
        secondsRemaining: withSecondsRemaining(music.expiresAt),
    };
};

const getDownloadJobById = async (jobId) => DownloadJobModel.findById(jobId).lean();

const markJobAsDownloaded = async (jobId) => {
    const job = await DownloadJobModel.findById(jobId);
    if (!job || !job.result?.sourceUrl) {
        return null;
    }

    const expiresAt = new Date(Date.now() + config.deleteAfterDownloadMinutes * 60 * 1000);
    await MusicModel.updateOne(
        { sourceUrl: job.result.sourceUrl, url: job.result.url },
        {
            $set: {
                downloadedAt: new Date(),
                lifecycleStatus: 'downloaded',
                expiresAt,
            },
        },
    );
    const updatedJob = await DownloadJobModel.findByIdAndUpdate(jobId, {
        'result.lifecycleStatus': 'downloaded',
        'result.expiresAt': expiresAt,
        'result.secondsRemaining': withSecondsRemaining(expiresAt),
        expiresAt,
    }, { new: true }).lean();

    return updatedJob;
};

const deleteImageKitFile = async (fileId) => {
    if (!fileId) {
        return false;
    }
    try {
        await client.files.delete(fileId);
        return true;
    } catch (error) {
        const message = String(error?.message || '');
        if (message.toLowerCase().includes('not found')) {
            return true;
        }
        return false;
    }
};

const cleanupExpiredMusicFiles = async () => {
    const now = new Date();
    const expiredRecords = await MusicModel.find({
        lifecycleStatus: { $in: ['ready', 'downloaded', 'expired'] },
        expiresAt: { $lte: now },
    }).lean();

    if (!expiredRecords.length) {
        return { scanned: 0, deleted: 0, failed: 0, skipped: 0 };
    }

    let deleted = 0;
    let failed = 0;
    let skipped = 0;

    for (const record of expiredRecords) {
        if (!record.fileId) {
            skipped += 1;
            continue;
        }

        const removedFromImageKit = await deleteImageKitFile(record.fileId);
        if (!removedFromImageKit) {
            failed += 1;
            continue;
        }

        await MusicModel.updateOne(
            { _id: record._id },
            { $set: { lifecycleStatus: 'deleted', url: '' } },
        );
        await DownloadJobModel.updateMany(
            { 'result.fileId': record.fileId },
            {
                $set: {
                    status: 'expired',
                    'result.lifecycleStatus': 'deleted',
                    'result.url': '',
                    'result.downloadUrl': '',
                },
            },
        );
        deleted += 1;
    }

    return { scanned: expiredRecords.length, deleted, failed, skipped };
};

const startCleanupScheduler = () => {
    if (cleanupTimer) {
        return cleanupTimer;
    }

    const runCleanup = async () => {
        try {
            await cleanupExpiredMusicFiles();
        } catch {
            // retry on next interval
        }
    };

    runCleanup();
    cleanupTimer = setInterval(runCleanup, config.cleanupIntervalMs);
    return cleanupTimer;
};

export {
    queueDownloadJob,
    getDownloadJobById,
    getCachedMusicBySourceUrl,
    markJobAsDownloaded,
    cleanupExpiredMusicFiles,
    startCleanupScheduler,
};
