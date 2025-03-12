const axios = require('axios');
const User = require("../models/user");

//***************** MONGO DB RELATED ENDPOINTS ******************//
const createUser = async (displayName, email, highScore = 0) => {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return { status: 400, message: "User already exists with that email" };
      }
  
      const newUser = new User({
        displayName,
        email,
        highScore,
      });
  
      const savedUser = await newUser.save();
      return { status: 201, user: savedUser }; 
    } catch (error) {
      console.error("Error creating user:", error);
      return { status: 500, message: "Error creating user" };
    }
};

// Update high score for a user
const updateHighScore = async (email, difficulty, score, artist) => {
    try {
      const user = await User.findById(email);
      if (!user) {
        return { status: 404, message: 'User not found' };
      }
  
      // Update the high score for the specified difficulty
      if (user.highScores[difficulty]) {
        user.highScores[difficulty].score = score;
        user.highScores[difficulty].artist = artist;
        
        // Save the updated user document
        const updatedUser = await user.save();
        return { status: 200, user: updatedUser };
      } else {
        return { status: 400, message: 'Invalid difficulty' };
      }
    } catch (error) {
      console.error("Error updating high score:", error);
      return { status: 500, message: "Error updating high score" };
    }
  };
  

// Get a user by email
const getUser = async (req, res) => {
    const { email } = req.params; // Use URL params to get the email
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Respond with the user data
      res.status(200).json(user);
    } catch (error) {
      console.error('Error retrieving user:', error);
      res.status(500).json({ message: 'Error retrieving user' });
    }
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
};
