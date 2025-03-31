import dotenv from 'dotenv';
import express, { json } from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

//for fidning the parent directory of the current module
import { fileURLToPath } from 'url';
import { dirname } from 'path';

//redis session related
import { createClient } from 'redis';
import {RedisStore} from 'connect-redis';

import userRoutes from './routes/userRoutes.js';
import songRoutes from './routes/songRoutes.js';
import authRoutes from './routes/authRoutes.js';
import staticRoutes from './routes/staticRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const origin = process.env.CORS_ORIGIN;
const session_secret = process.env.SESSION_SECRET;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: 'Too many requests from this IP, please try again after 15 minutes',
  headers: true, 
});

const redisClient = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on('error', (err) => {
  if (err.code === 'ECONNRESET') {
      console.error('Redis connection reset. Attempting to reconnect...');
      redisClient.connect();
  } else {
      console.error('Redis error:', err);
  }
});
await redisClient.connect().catch(console.error);

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
      store: new RedisStore({ client: redisClient, ttl: 3600}),
      secret: session_secret,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false } 
      // cookie: {
      //   httpOnly: true,  // Cookie is HTTP-only (can't be accessed by JavaScript)
      //   secure: process.env.NODE_ENV === 'production',  // Only send cookie over HTTPS in production
      //   maxAge: 1000 * 60 * 60, // 1 hour expiration for the session cookie
      // },
   }))
   .use(json())
   .use(limiter);

app.use('/', userRoutes);
app.use('/', songRoutes);
app.use('/', authRoutes);
app.use('/', staticRoutes); 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
