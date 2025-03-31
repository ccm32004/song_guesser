import express from 'express';
import { getProfile, getUser, updateHighScore } from '../controllers/userController.js';
import authenticateJWT from '../middleware/jwtToken.js';

const router = express.Router();

// router.post('/create', userController.createUser);

router.post('/update-high-score', authenticateJWT, updateHighScore);

router.get('/get-user-stats', authenticateJWT, getUser);

router.get('/profile', authenticateJWT, getProfile);

export default router;
