import express from 'express';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

router.get('/api/songNames/:artistName', (req, res) => {
  const artistName = req.params.artistName; 

  const formattedArtistName = artistName.toLowerCase().replace(/\s+/g, '');
  const filePath = path.join(__dirname, `../songTitles/${formattedArtistName}.json`);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: "Artist's song list not found." });
    }
  });
});

export default router;
