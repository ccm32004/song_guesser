import express from 'express';
import { login, callback } from '../controllers/authController.js'; 

const router = express.Router();

router.get('/api/login', login);

router.get('/api/callback', callback);

export default router;
