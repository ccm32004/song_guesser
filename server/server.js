require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const userRoutes = require('./routes/userRoutes');
const songRoutes = require('./routes/songRoutes');
const authRoutes = require('./routes/authRoutes');
const staticRoutes = require('./routes/staticRoutes');

const app = express();
const PORT = process.env.PORT || 3001;
const origin = process.env.CORS_ORIGIN;
const session_secret = process.env.SESSION_SECRET;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: 'Too many requests from this IP, please try again after 15 minutes',
  headers: true, 
});

//TODO: set cors policy to only allow the frontend domain in production
app.use(express.static(__dirname + '/public'))
   .use(cookieParser())
   .use(cors({
      origin: origin,
      methods: 'GET, POST, PUT, DELETE',
      credentials: true,
      allowedHeaders: ['Authorization', 'Content-Type'], 
  }))
   .use(session({
       secret: session_secret,
       resave: false,
       saveUninitialized: true,
       cookie: { secure: false } // Set secure: true in production with HTTPS
   }))
   .use(express.json())
   .use(limiter);

app.use('/', userRoutes);
app.use('/', songRoutes);
app.use('/', authRoutes);
app.use('/', staticRoutes); 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
