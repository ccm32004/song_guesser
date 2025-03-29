const axios = require('axios');
const User = require("../models/user");
const mongoose = require('mongoose');

//for the dev kill all users button
const mongoURI = process.env.MONGO_URI;

//mongo db connection state defintions : 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

//***************** MONGO DB RELATED ENDPOINTS ******************//
const createUser = async (displayName, email) => {
  console.log("creating user mayhaps")
  console.log(mongoose.connection.readyState); 
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { status: 400, message: "User already exists with that email" };
    }

    // Create a new user with an empty artists array
    const newUser = new User({
      displayName,
      email,
      artists: []  // Initialize with an empty array for artists
    });

    const baseHighScores = {
      easy: { score: 0 },
      medium: { score: 0 },
      hard: { score: 0 }
    };
    
    // Array of artist names (this can be dynamically generated or modified)
    const artistNames = ["Taylor Swift", "Playboi Carti", "The Weeknd"];
    
    // Loop through artist names and create artists dynamically
    artistNames.forEach(artistName => {
      const artist = {
        artistName,
        highScores: baseHighScores // Use the same highScores structure for all artists
      };
      
      // Push the new artist into the artists array
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
  const { email } = req.user; // Get the email from the authenticated user
  console.log('Mongoose connection state for updatehighscore:', mongoose.connection.readyState); // Debugging: Check connection status
  
  try {
    // Find the user by their email (assuming email is stored as an _id)
    const user = await User.findOne({ email });
    console.log('User found:', user); // Debugging: Check if user was found
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the artist in the user's artists array
    let artist = user.artists.find(artist => artist.artistName === artistName);
    console.log('Artist found:', artist); // Debugging: Check if artist was found

    // If the artist doesn't exist, create a new one
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
      // Push the new artist into the artists array
      user.artists.push(artist);
    }

    // Check if the difficulty is valid
    if (!artist.highScores[difficulty]) {
      console.log("Invalid difficulty");
      return res.status(400).json({ message: 'Invalid difficulty' });
    }

    // Compare the current high score with the new score and update if the new score is higher
    if (artist.highScores[difficulty].score < score) {
      artist.highScores[difficulty].score = score;
      console.log("Updating high score", artist.highScores[difficulty].score);
      await user.save(); // Save the updated user document to the database
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
    const { email } = req.user; // Use URL params to get the email
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Respond with the user data
      console.log("returned user", user)
      res.status(200).json(user);
    } catch (error) {
      console.error('Error retrieving user:', error);
      res.status(500).json({ message: 'Error retrieving user' });
    }
};

const deleteAllUsers = async () => {
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(async () => {
    console.log('Connected to MongoDB');
    
    await User.deleteMany({});
    console.log('All users deleted');
    
    mongoose.disconnect();
    return { status: 204, message: "Successfully deleted all users"}; 
  }).catch(err => {
    console.error('Error connecting to MongoDB', err);
  });
};

//***************** SPOTIFY API ENDPOINTS RELATING TO USER ******************//
// async function getProfile(req, res) {
//   try {
//     const access_token = req.session.access_token
    
//     if (!access_token) {
//       return res.status(401).json({ error: 'Unauthorized access' });
//     }

//     const response = await axios.get('https://api.spotify.com/v1/me', {
//       headers: { Authorization: `Bearer ${access_token}` },
//     });

//     res.json(response.data);
//   } catch (err) {
//     res.status(500).send('Error fetching user profile');
//   }
// }

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

module.exports = {
  createUser,
  updateHighScore,
  getUser,
  getProfile,
  getUserProfile,
  deleteAllUsers
};
