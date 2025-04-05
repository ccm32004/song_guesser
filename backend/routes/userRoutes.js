import express from 'express';
import { getProfile, getUser, updateHighScore } from '../controllers/userController.js';
import authenticateJWT from '../middleware/jwtToken.js';

const router = express.Router();

router.post('/api/update-high-score', authenticateJWT, updateHighScore);

router.get('/api/get-user-stats', authenticateJWT, getUser);

router.get('/api/profile', authenticateJWT, getProfile);

export default router;
