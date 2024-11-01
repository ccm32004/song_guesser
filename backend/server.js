const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

//cache the token later so u dont have to req everytime

// Function to get Spotify access token
async function getAccessToken() {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const response = await axios.post(tokenUrl, new URLSearchParams({
        grant_type: 'client_credentials',
    }), {
        headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data.access_token;
}

//move routes to a separate file later???
// Route to get a Taylor Swift song snippet
app.get('/getTrackId', async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                q: 'Taylor Swift',
                type: 'track',
                limit: 1, // Get one song
                market: 'CA'
            },
        });

        const song = searchResponse.data.tracks.items[0];
        if (song) {
            console.log("found song")
            const snippetUrl = song.preview_url; // URL for the song snippet
            console.log(snippetUrl);
            res.json({
                title: song.name,
                artist: song.artists[0].name,
                uri: song.uri,
                preview_url: song.preview_url,
            });
        } else {
            res.status(404).json({ error: 'No song found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching song snippet');
    }
});

app.get('/track/:id', async (req, res) => {
    const trackId = req.params.id; // Get the track ID from the URL

    try {
        console.log("getting track preview url");
        const accessToken = await getAccessToken();
        const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                market: 'CA'
            },
        });

        // Check if track data is returned
        if (response.data) {
            const track = response.data;
            console.log(track);
            res.json({
                title: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                preview_url: track.preview_url, // The URL for the track's preview
                album: track.album.name,
            });
        } else {
            res.status(404).json({ error: 'Track not found' });
        }
    } catch (err) {
        console.error('Error fetching track details:', err);
        res.status(500).send('Error fetching track details');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

//basucally the cook is to authorization code flow bc client credentials don't work for preview URLS