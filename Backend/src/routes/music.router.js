import {Router} from 'express';
import { createDownloadJob, getDownloadStatus, getDownloadLink } from '../controller/music.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
const Musicrouter = Router();

// Example route for music-related operations
// @route POST /api/music/download
// full address http://localhost:5000/api/music/download
Musicrouter.post('/download', authMiddleware, createDownloadJob);
Musicrouter.get('/download/status/:jobId', getDownloadStatus);
Musicrouter.get('/download/link/:jobId', getDownloadLink);

export default Musicrouter;