import mongoose from 'mongoose';

const DownloadJobSchema = new mongoose.Schema({
    sourceUrl: {
        type: String,
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['queued', 'processing', 'completed', 'failed', 'expired'],
        default: 'queued',
        index: true,
    },
    progress: {
        type: Number,
        default: 0,
    },
    result: {
        title: String,
        url: String,
        downloadUrl: String,
        thumbnail: String,
        duration: Number,
        format: {
            container: String,
        },
        mimeType: String,
        mediaType: String,
        sourceUrl: String,
        fileId: String,
        filePath: String,
        fileSizeBytes: Number,
        uploadedAt: Date,
        expiresAt: Date,
        secondsRemaining: Number,
        lifecycleStatus: String,
    },
    timings: {
        ytDlpStart: Number,
        streamComplete: Number,
        uploadComplete: Number,
        dbComplete: Number,
        total: Number,
    },
    error: {
        type: String,
        default: '',
    },
    errorCode: {
        type: String,
        default: '',
    },
    storageState: {
        type: String,
        enum: ['ok', 'near_limit', 'full'],
        default: 'ok',
    },
    expiresAt: {
        type: Date,
        default: null,
        index: true,
    },
}, { timestamps: true });

const DownloadJobModel = mongoose.model('DownloadJobModel', DownloadJobSchema);
export default DownloadJobModel;
