// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../userController');

// POST route for creating a single user
router.post('/create', userController.createUser);

// POST route for updating a user's high score
router.post('/update-high-score', userController.updateHighScore);

// GET route for retrieving a user by email
router.get('/get/:email', userController.getUser);

module.exports = router;
