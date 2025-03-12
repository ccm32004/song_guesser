const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/api/songNames', (req, res) => {
  res.sendFile(path.join(__dirname, '../songs.json')); // Adjust the path to the correct location
});
module.exports = router;
