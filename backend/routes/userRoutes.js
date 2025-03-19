const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/create', userController.createUser);

router.post('/update-high-score', userController.updateHighScore);

router.get('/get/:email', userController.getUser);

router.get('/profile', userController.getProfile);

router.delete('/deleteAllUsers', userController.deleteAllUsers);

module.exports = router;
