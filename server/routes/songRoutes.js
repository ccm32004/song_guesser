import express from 'express';
import { getTrackSnippet } from '../controllers/songController.js';
import { getValidAccessToken } from '../middleware/spotifyToken.js';

const router = express.Router();

router.get('/getTrackSnippet', getValidAccessToken, getTrackSnippet);

export default router;
