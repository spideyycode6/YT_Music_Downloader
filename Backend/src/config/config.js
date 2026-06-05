import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/myapp',
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    imageKitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    imageKitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    imageKitUrlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
    enableAudioCompression: process.env.ENABLE_AUDIO_COMPRESSION || 'false',
    maxAudioBufferBytes: Number(process.env.MAX_AUDIO_BUFFER_BYTES || 60 * 1024 * 1024),
    maxDurationSeconds: Number(process.env.MAX_DURATION_SECONDS || 900),
    maxActiveJobs: Number(process.env.MAX_ACTIVE_JOBS || 3),
    imageKitMaxBytes: Number(process.env.IMAGEKIT_MAX_BYTES || 19 * 1024 * 1024),
    minStorageHeadroomBytes: Number(process.env.MIN_STORAGE_HEADROOM_BYTES || 2 * 1024 * 1024),
    downloadTtlMinutes: Number(process.env.DOWNLOAD_TTL_MINUTES || 60),
    deleteAfterDownloadMinutes: Number(process.env.DELETE_AFTER_DOWNLOAD_MINUTES || 10),
    cleanupIntervalMs: Number(process.env.CLEANUP_INTERVAL_MS || 5 * 60 * 1000),
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
    frontendOrigins: (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://localhost:5174')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
};

export default config;

