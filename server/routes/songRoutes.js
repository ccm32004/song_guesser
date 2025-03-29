const express = require('express');
const router = express.Router();
const { getTrackSnippet } = require('../controllers/songController');
const { getValidAccessToken } = require('../middleware/spotifyToken');

router.get('/getTrackSnippet', getValidAccessToken, getTrackSnippet);

module.exports = router;
