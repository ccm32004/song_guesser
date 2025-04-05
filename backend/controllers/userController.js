import axios from 'axios';
import User from '../models/user.js';
import mongoose from 'mongoose';

//mongo db connection state defintions : 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

//***************** MONGO DB RELATED ENDPOINTS ******************//
const createUser = async (displayName, email) => {
  console.log("creating user mayhaps")
  console.log(mongoose.connection.readyState); 
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { status: 400, message: "User already exists with that email" };
    }

    const newUser = new User({
      displayName,
      email,
      artists: []  
    });

    const baseHighScores = {
      easy: { score: 0 },
      medium: { score: 0 },
      hard: { score: 0 }
    };
    
    const artistNames = ["Taylor Swift", "Playboi Carti", "The Weeknd"];
    
    artistNames.forEach(artistName => {
      const artist = {
        artistName,
        highScores: baseHighScores 
      };
      
      newUser.artists.push(artist);
    });

    // Save the new user
    const savedUser = await newUser.save();
    return { status: 201, user: savedUser }; 
  } catch (error) {
    console.error("Error creating user:", error);
    return { status: 500, message: "Error creating user" };
  }
};

//update highscore
const updateHighScore = async (req, res) => {
  const { artistName, difficulty, score } = req.body; 
  const { email } = req.user; 
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let artist = user.artists.find(artist => artist.artistName === artistName);

    if (!artist) {
      console.log("Creating new artist entry");
      artist = {
        artistName,
        highScores: {
          easy: { score: 0 },
          medium: { score: 0 },
          hard: { score: 0 }
        }
      };
      user.artists.push(artist);
    }

    if (!artist.highScores[difficulty]) {
      console.log("Invalid difficulty");
      return res.status(400).json({ message: 'Invalid difficulty' });
    }

    if (artist.highScores[difficulty].score < score) {
      artist.highScores[difficulty].score = score;
      console.log("Updating high score", artist.highScores[difficulty].score);
      await user.save(); 
      console.log("Updated and sending response", artist.highScores[difficulty].score);
      return res.status(200).json({ status: 200, message: 'High score updated successfully', highScore: artist.highScores[difficulty].score });
    } else {
      console.log("New score is not higher than the current high score");
      return res.status(200).json({ status: 200, message: 'New score is not higher than the current high score', highScore: artist.highScores[difficulty].score });
    }

  } catch (error) {
    console.error("Error updating high score:", error);
    return res.status(500).json({ message: 'Error updating high score' });
  }
};

// Get a user by email
const getUser = async (req, res) => {
  console.log(mongoose.connection.readyState); 
    const { email } = req.user; 
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      console.log("returned user", user)
      res.status(200).json(user);
    } catch (error) {
      console.error('Error retrieving user:', error);
      res.status(500).json({ message: 'Error retrieving user' });
    }
};

//***************** SPOTIFY API ENDPOINTS RELATING TO USER ******************//
async function getProfile(req, res) { 
  const { display_name } = req.user;

  res.json({
    message: 'User profile data',
    display_name
  });
}

const getUserProfile = (accessToken) => {
  return axios.get('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

export{
  createUser,
  updateHighScore,
  getUser,
  getProfile,
  getUserProfile
};