require('dotenv').config();
const express = require('express');
const request = require('request');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios'); 
const { access } = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const client_id = process.env.SPOTIFY_CLIENT_ID; // Your client ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your client secret
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI; 

app.use(express.static(__dirname + '/public'))
   .use(cookieParser())
   .use(cors())
   .use(session({
       secret: 'your-secret-key', // Use a strong secret in production
       resave: false,
       saveUninitialized: true,
       cookie: { secure: false } // Set secure: true in production with HTTPS
   }));

app.get('/login', (req, res) => {
    const state = generateRandomString(16);
    res.cookie('spotify_auth_state', state);
  
    const scope = 'user-read-private user-read-email';
    console.log("redirecting to spotify login");

    res.redirect('https://accounts.spotify.com/authorize?' +
      new URLSearchParams({
        response_type: 'code',
        client_id,
        scope,
        redirect_uri,
        state
    }));
});

app.get('/callback', (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;

    console.log("callback");
  
    if (state === null || state !== storedState) {
      res.redirect('/#' +
        new URLSearchParams({ error: 'state_mismatch' }));
    } else {
      res.clearCookie('spotify_auth_state');
  
      const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code,
          redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')
        },
        json: true
      };
  
      request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const access_token = body.access_token;
          const refresh_token = body.refresh_token;
  
          // Store tokens in session
          req.session.access_token = access_token;
          req.session.refresh_token = refresh_token;

           // Save session
          req.session.save((err) => {
            if (err) {
              console.error('Failed to save session:', err);
              res.redirect('http://localhost:3000/?error=session_save_failed');
            } else {
              //check if the session contains the token info
              console.log("SESSION INFO");
              console.log('Session saved:', req.session);
              res.redirect(`http://localhost:3000/dashboard?access_token=${access_token}`);
            }
          });

  
          // Redirect or respond with tokens
        //   res.redirect('/#' +
        //     new URLSearchParams({ access_token, refresh_token }));
        } else {
          res.redirect('http://localhost:3000/?error=authentication_failed');
        //   res.redirect('/#' +
        //     new URLSearchParams({ error: 'invalid_token' }));
        }
      });
    }
  });

// Refresh token endpoint
app.get('/refresh_token', (req, res) => {
    const refresh_token = req.session.refresh_token;
  
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token
      },
      json: true
    };
  
    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const access_token = body.access_token;
        res.send({ access_token });
      } else {
        res.status(response.statusCode).send({ error: 'Failed to refresh token' });
      }
    });
});

//move routes to a separate file later???
// Route to get a Taylor Swift song snippet
app.get('/getTrackId', async (req, res) => {
    try {
        const access_token = req.session.access_token;
        console.log("GETTING TOKEN")
        console.log(access_token);
        const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
            params: {
                q: 'Taylor Swift', // Search for Taylor Swift
                type: 'track',
                limit: 1, // Get one song
                market: 'CA'
            },
        });

        const song = searchResponse.data.tracks.items[0];
        if (song) {
            console.log("found song")
            console.log("Song details:", song); // Log all song details
            const snippetUrl = song.preview_url; // URL for the song snippet
            console.log("GETTING SNIPPET FROM GET TRACK ID API")
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
    console.log(trackId);

    try {
        console.log("getting track preview url");
        const access_token = req.session.access_token;
        console.log(access_token);
        const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
            params: {
                market: 'CA'
            },
        });

        // Check if track data is returned
        if (response.data) {
            const track = response.data;
            console.log("TRYING SECOND API CALL")
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

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
