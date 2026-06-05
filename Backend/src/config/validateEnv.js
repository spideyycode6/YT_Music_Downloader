const REQUIRED_VARS = [
    'MONGO_URI',
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
    'IMAGEKIT_PRIVATE_KEY',
    'IMAGEKIT_PUBLIC_KEY',
    'IMAGEKIT_URL_ENDPOINT',
];

const INSECURE_DEFAULTS = new Set([
    'your_jwt_secret',
    'your_refresh_token_secret',
    'change-this-secret',
]);

export function validateEnv() {
    const missing = REQUIRED_VARS.filter((key) => !process.env[key]?.trim());
    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (INSECURE_DEFAULTS.has(process.env.JWT_SECRET)) {
        throw new Error('JWT_SECRET must be set to a strong unique value');
    }

    if (INSECURE_DEFAULTS.has(process.env.REFRESH_TOKEN_SECRET)) {
        throw new Error('REFRESH_TOKEN_SECRET must be set to a strong unique value');
    }
}
