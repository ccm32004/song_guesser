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
    highScores: {
        easy: {
          score: {
            type: Number,
            default: 0,
          },
          artist: {
            type: String,  // Artist name or id associated with the score
            default: 'unknown',
          },
        },
        medium: {
          score: {
            type: Number,
            default: 0,
          },
          artist: {
            type: String,
            default: 'unknown',
          },
        },
        hard: {
          score: {
            type: Number,
            default: 0,
          },
          artist: {
            type: String,
            default: 'unknown',
          },
        },
    },
});


// Create a model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;