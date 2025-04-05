import dotenv from 'dotenv';
// dotenv.config(); 
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development' });
} else if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
}

import jwt from 'jsonwebtoken';  // Import the entire CommonJS module as a default import
const { verify } = jwt;        // Then destructure the 'verify' method from the imported object
const JWT_SECRET = process.env.JWT_SECRET 

const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  // If no token is provided, return an error
  if (!token) {
    console.log("token test failedddd 1")
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("token test failedddd 2")
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  
    req.user = decoded;
    next(); 
  });
};

export default authenticateJWT;
