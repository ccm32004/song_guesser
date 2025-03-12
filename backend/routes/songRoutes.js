const express = require('express');
const router = express.Router();
const { getTrackSnippet } = require('../controllers/songController');
const { getValidAccessToken } = require('../middleware/tokenMiddleware');

router.get('/getTrackSnippet', getValidAccessToken, getTrackSnippet);
//TODO: change the front end to use this endpoint

module.exports = router;
