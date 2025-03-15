const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/api/songNames/:artistName', (req, res) => {
  const artistName = req.params.artistName; 

  const filePath = path.join(__dirname, `../songTitles/${artistName}.json`);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: "Artist's song list not found." });
    }
  });
});
module.exports = router;
