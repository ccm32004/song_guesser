const axios = require('axios');
const mongoose = require('mongoose');
const userController = require('./userController');
const { getUserProfile } = require('./userController');

//this is for the frontend token
const jwt = require('jsonwebtoken');

const client_id = process.env.SPOTIFY_CLIENT_ID; 
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; 
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI; 
const mongoURI = process.env.MONGO_URI;
const jwt_secret = process.env.JWT_SECRET;

//generates a random string to prevent CSRF attacks
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function login(req, res) {
    const state = generateRandomString(16);
    res.cookie('spotify_auth_state', state);

    const scope = 'user-read-private user-read-email';
    console.log("Redirecting to Spotify login...");

    res.redirect('https://accounts.spotify.com/authorize?' +
      new URLSearchParams({
        response_type: 'code',
        client_id: client_id,
        scope,
        redirect_uri: redirect_uri,
        state,
    }));
}

async function callback(req, res) {
    try {
      const { code, state } = req.query;
      const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;
  
      // Check if state matches
      if (state !== storedState) {
        return res.redirect('/#' + new URLSearchParams({ error: 'state_mismatch' }));
      }
  
      res.clearCookie('spotify_auth_state'); // Clear the cookie
  
      // Prepare data for the token request
      const authData = new URLSearchParams({
        code,
        redirect_uri,
        grant_type: 'authorization_code',
      });
  
      // Send a POST request to get the access and refresh tokens
      const authResponse = await axios.post('https://accounts.spotify.com/api/token', authData, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
        },
      });
  
      const { access_token, refresh_token, expires_in } = authResponse.data;

      const tokenExpiry = Date.now() + expires_in * 1000; 

        // Store tokens and expiration time in the session
      req.session.access_token = access_token;
      req.session.refresh_token = refresh_token;
      req.session.token_expiry = tokenExpiry;
    
      // Save session
      await req.session.save();
  
      // Connect to MongoDB
      await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  
      console.log('Connected to MongoDB');
  
      // Fetch the user profile from Spotify
      const userProfileResponse = await getUserProfile(access_token);
      const { display_name, email } = userProfileResponse.data;
  
      // Create or update the user in the database
      const savedUser = await userController.createUser(display_name, email);
      console.log('New user created:', savedUser);

      //make jwt token
      const token = jwt.sign(
        { display_name, email}, 
        jwt_secret, 
        { expiresIn: '1h' }  // Expiration time for the JWT
      );
  
      // Redirect to dashboard with the access token
      //TOO: do we need this access token lmao
      console.log("token: ", token)
      return res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  
    } catch (err) {
      console.error('Error during callback process:', err);
      // Handle errors
      return res.redirect('http://localhost:3000/?error=' + encodeURIComponent(err.message));
    }
}

//TODO: actually use this when the accesstoken parameter doesn't work and returns error 404
function refreshToken (req, res) {
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
};

module.exports = { login, callback, refreshToken };