const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/jwtToken');

// router.post('/create', userController.createUser);

router.post('/update-high-score', authenticateJWT, userController.updateHighScore);

router.get('/get-user-stats', authenticateJWT, userController.getUser);

router.get('/profile', authenticateJWT, userController.getProfile);

module.exports = router;
