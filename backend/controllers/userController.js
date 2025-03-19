const axios = require('axios');
const User = require("../models/user");
const mongoose = require('mongoose');

//for the dev kill all users button
const mongoURI = process.env.MONGO_URI;

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

    // Save the new user
    const savedUser = await newUser.save();
    return { status: 201, user: savedUser }; 
  } catch (error) {
    console.error("Error creating user:", error);
    return { status: 500, message: "Error creating user" };
  }
};

// Update high score for a user
const updateHighScore = async (email, artistName, difficulty, score) => {
  console.log(mongoose.connection.readyState); 
    try {
      const user = await User.findById(email);
      if (!user) {
        return { status: 404, message: 'User not found' };
      }

      const artist = user.artists.find(artist => artist.artistName === artistName);

      if (!artist) {
        user.artists.push({
          artistName,
          highScores: {
            easy: { score: 0 },
            medium: { score: 0 },
            hard: { score: 0 }
          }
        })
      }

      const artistToUpdate = user.artists[artistName];

      if (artistToUpdate.highScores[difficulty] === undefined) {
        return { status: 400, message: 'Invalid difficulty' };
      }

      if (artistToUpdate.highScores[difficulty].score < score) {
        artistToUpdate.highScores[difficulty].score = score;
      } else{
        return { status: 200, message: 'New score is not higher than the current high score' };
      }
  
    } catch (error) {
      console.error("Error updating high score:", error);
      return { status: 500, message: "Error updating high score" };
    }
  };
  

// Get a user by email
const getUser = async (req, res) => {
  console.log(mongoose.connection.readyState); 
    const { email } = req.params; // Use URL params to get the email
  
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
async function getProfile(req, res) {
  try {
    const access_token = req.session.access_token
    
    if (!access_token) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).send('Error fetching user profile');
  }
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
