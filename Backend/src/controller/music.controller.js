import { queueDownloadJob, getDownloadJobById, getCachedMusicBySourceUrl, markJobAsDownloaded } from '../service/music.service.js';
import normalizeYouTubeUrl from '../utils/normalizeYoutubeUrl.js';

const createDownloadJob = async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ success: false, message: "URL is required" });
    }
    try {
        const normalizedUrl = normalizeYouTubeUrl(url);

        // Fast path: return cached result when this URL was already processed.
        const cachedMusic = await getCachedMusicBySourceUrl(normalizedUrl);
        if (cachedMusic) {
            return res.status(200).json({
                success: true,
                data: {
                    title: cachedMusic.title,
                    url: cachedMusic.url,
                    downloadUrl: cachedMusic.url,
                    thumbnail: cachedMusic.thumbnail,
                    format: { container: 'mp3' },
                    mimeType: 'audio/mpeg',
                    mediaType: 'audio',
                    expiresAt: cachedMusic.expiresAt,
                    secondsRemaining: cachedMusic.secondsRemaining,
                    lifecycleStatus: cachedMusic.lifecycleStatus,
                    storageState: 'ok',
                    cached: true,
                },
            });
        }

        const job = await queueDownloadJob(normalizedUrl);
        return res.status(202).json({
            success: true,
            jobId: job._id,
            status: job.status,
            storageState: job.storageState || 'ok',
            message: 'Download started. Poll status endpoint for completion.',
        });
    } catch (error) {
        if (error.code === 'TOO_MANY_ACTIVE_JOBS' || error.code === 'STORAGE_FULL') {
            return res.status(429).json({
                success: false,
                code: error.code,
                message: error.message,
            });
        }
        return res.status(500).json({ success: false, message: "Error creating download job" });
    }
};

const getDownloadStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await getDownloadJobById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        return res.status(200).json({
            success: true,
            data: {
                jobId: job._id,
                status: job.status,
                progress: job.progress,
                result: job.result ? {
                    ...job.result,
                    format: { container: 'mp3' },
                    mimeType: 'audio/mpeg',
                    mediaType: 'audio',
                    downloadUrl: job.result.url,
                    secondsRemaining: job.result.expiresAt
                        ? Math.max(0, Math.floor((new Date(job.result.expiresAt).getTime() - Date.now()) / 1000))
                        : 0,
                } : null,
                timings: job.timings || null,
                storageState: job.storageState || 'ok',
                expiresAt: job.expiresAt || job.result?.expiresAt || null,
                error: job.error || '',
                errorCode: job.errorCode || '',
            },
        });
    } catch {
        return res.status(500).json({ success: false, message: 'Error fetching download status' });
    }
};

const getDownloadLink = async (req, res) => {
    try {
        const { jobId } = req.params;
        const updatedJob = await markJobAsDownloaded(jobId);
        if (!updatedJob || !updatedJob.result?.url) {
            return res.status(404).json({ success: false, code: 'FILE_EXPIRED', message: 'Download link is no longer available' });
        }

        return res.status(200).json({
            success: true,
            data: {
                jobId: updatedJob._id,
                downloadUrl: updatedJob.result.url,
                mimeType: 'audio/mpeg',
                mediaType: 'audio',
                format: { container: 'mp3' },
                expiresAt: updatedJob.result.expiresAt || updatedJob.expiresAt || null,
                secondsRemaining: updatedJob.result.secondsRemaining || 0,
                lifecycleStatus: updatedJob.result.lifecycleStatus || 'downloaded',
            },
        });
    } catch {
        return res.status(500).json({ success: false, message: 'Error creating download handoff link' });
    }
};

export { createDownloadJob, getDownloadStatus, getDownloadLink };