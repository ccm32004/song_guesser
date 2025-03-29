const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET 

const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  // If no token is provided, return an error
  if (!token) {
    console.log("token test failedddd 1")
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("token test failedddd 2")
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  
    req.user = decoded;
    next(); 
  });
};

module.exports = {authenticateJWT};
