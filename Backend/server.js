import app from './app.js';
import connectDB from './src/config/database.js';
import { config } from './src/config/config.js';
import { validateEnv } from './src/config/validateEnv.js';
import { startCleanupScheduler } from './src/service/music.service.js';

const START_PORT = Number(config.port) || 5000;

try {
    validateEnv();
} catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
}

connectDB();

const startServer = (port) => {
    const server = app.listen(port, () => {
        startCleanupScheduler();
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            setTimeout(() => startServer(port + 1), 200);
            return;
        }
        process.exit(1);
    });
};

startServer(START_PORT);
