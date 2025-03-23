const axios = require('axios');

//used to read the local json file
const fs = require('fs');
const path = require('path');

//used to parse the html
const cheerio = require('cheerio');
const jsonpath = require('jsonpath');

async function getTrackSnippet(req, res) {
    try {
        let access_token = req.session.clientAccessToken || req.session.access_token; 

        if (!access_token) {
            return res.status(401).json({ error: 'Unauthorized access: no access token' });
        }

        const artist = req.query.artist || 'Taylor Swift';
        const artistSongs = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'songTitles', `${artist.toLowerCase().replace(/\s+/g, '')}.json`), 'utf8'));
        const randomSongTitle = artistSongs[Math.floor(Math.random() * artistSongs.length)];
        const title = randomSongTitle || '';
        const query = `${title} artist:${artist}`.trim();
  
        const song = await searchSong(query, access_token, req);

        if (!song) {
            return res.status(404).json({ error: 'No song found' });
        }

        // Extract track ID from the song's URI
        const trackId = song.uri.split(':').pop();
        const previewUrl = await fetchPreviewUrl(trackId);

        if (!previewUrl) {
            return res.status(500).json({ error: 'Failed to fetch preview URL' });
        }

        res.json({
            title: song.name,
            artist: song.artists[0].name,
            uri: song.uri,
            previewUrl,
         });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching song snippet');
    }
}

//*HELPER FUNCTIONS *//
async function searchSong(query, access_token) {
  try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
          headers: { Authorization: `Bearer ${access_token}` },
          params: { q: query, type: 'track', limit: 1, market: 'CA' },
      });

      const song = response.data.tracks.items[0];
      return song ? song : null;

  } catch (err) {
    console.error(err);
    throw new Error('Error fetching song from Spotify');
  }
}

//fetch the preview URL of a track from the Spotify embed page
async function fetchPreviewUrl(trackId) {
    const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
  
    try {
        // Make the request to the Spotify embed page
        const response = await axios.get(embedUrl);
  
        if (response.status !== 200) {
            console.log(`Failed to fetch embed page: ${response.status}`);
            return null;
        }
  
        const html = response.data;
        const $ = cheerio.load(html); // Load HTML using cheerio
        const scriptElements = $('script');
  
        // Loop through script elements to find the relevant JSON data
        for (let i = 0; i < scriptElements.length; i++) {
            const scriptContent = $(scriptElements[i]).html();
  
            if (scriptContent) {
                // Try to find the audioPreview URL using JSONPath
                const previewUrl = findNodeValueWithJsonPath(scriptContent, 'audioPreview');
                if (previewUrl) {
                    console.log('Found preview URL:', previewUrl);
                    return previewUrl;
                }
            }
        }
    } catch (error) {
        console.log('Error fetching or parsing the page:', error.message);
        return null;
    }
    return null;
}

function findNodeValueWithJsonPath(jsonString, targetNode) {
    try {
        const query = `$..${targetNode}.url`;
        console.log(`Using JsonPath Query: ${query}`); // Debug query
  
        const result = jsonpath.query(JSON.parse(jsonString), query);
  
        if (result.length > 0) {
            return result[0]; 
        }
    } catch (error) {
        console.log('Error parsing JSON or applying JSONPath:', error.message);
    }
    return null;
  }

  
module.exports = { getTrackSnippet};