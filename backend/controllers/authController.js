import dotenv from 'dotenv';
// dotenv.config(); 
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development' });
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
}

import axios from 'axios';
import mongoose from 'mongoose';
import { getUserProfile, createUser } from './userController.js';

import jwt from 'jsonwebtoken';

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

//TOFO: fix this laterr 
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
      console.log("Callback function triggered");
      const { code, state } = req.query;
      const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;
  
      if (state !== storedState) {
        return res.redirect('/#' + new URLSearchParams({ error: 'state_mismatch' }));
      }
  
      res.clearCookie('spotify_auth_state'); // Clear the cookie
  
      const authData = new URLSearchParams({
        code,
        redirect_uri,
        grant_type: 'authorization_code',
      });
  
      const authResponse = await axios.post('https://accounts.spotify.com/api/token', authData, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
        },
      });
  
      const { access_token, refresh_token, expires_in } = authResponse.data;

      const tokenExpiry = Date.now() + expires_in * 1000; 

      req.session.access_token = access_token;
      req.session.refresh_token = refresh_token;
      req.session.token_expiry = tokenExpiry;

      await req.session.save();

      console.log("connecting to mongoose")
  
      await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  
      // Fetch the user profile from Spotify
      const userProfileResponse = await getUserProfile(access_token);
      const { display_name, email } = userProfileResponse.data;
  
      // Create or update the user in the database
      const savedUser = await createUser(display_name, email);
      console.log('New user created:', savedUser);

      //make jwt token
      const token = jwt.sign(
        { display_name, email}, 
        jwt_secret, 
        { expiresIn: '1h' } 
      );
  
      //TOO: do we need this access token lmao
      console.log("token: ", token)
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  
    } catch (err) {
      console.error('Error during callback process:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/?error=` + encodeURIComponent(err.message));
    }
}

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

export { login, callback, refreshToken };