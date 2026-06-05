import mongoose from 'mongoose';

const MusicSchema = new mongoose.Schema({
    sourceUrl: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        default: ''
    },
    format: {
        container: {
            type: String,
            default: 'mp3',
        },
    },
    mimeType: {
        type: String,
        default: 'audio/mpeg',
    },
    mediaType: {
        type: String,
        default: 'audio',
    },
    fileId: {
        type: String,
        default: '',
        index: true,
    },
    filePath: {
        type: String,
        default: '',
    },
    fileSizeBytes: {
        type: Number,
        default: 0,
    },
    uploadedAt: {
        type: Date,
        default: null,
    },
    expiresAt: {
        type: Date,
        default: null,
        index: true,
    },
    downloadedAt: {
        type: Date,
        default: null,
    },
    lifecycleStatus: {
        type: String,
        enum: ['ready', 'downloaded', 'expired', 'deleted'],
        default: 'ready',
        index: true,
    },
}, { timestamps: true });

const MusicModel = mongoose.model('MusicModel', MusicSchema);
export default MusicModel;