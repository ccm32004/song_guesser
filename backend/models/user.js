const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  artists: [
    {
      artistName: {
        type: String,
        required: true,
      },
      highScores: {
        easy: {
          score: {
            type: Number,
            default: 0,
          },
        },
        medium: {
          score: {
            type: Number,
            default: 0,
          },
        },
        hard: {
          score: {
            type: Number,
            default: 0,
          },
        },
      },
    },
  ],
});

// Create a model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;