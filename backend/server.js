import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

dotenv.config();

import connectDB from './config/db.js';
import passport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import fieldRoutes from './routes/fieldRoutes.js';
import waterRoutes from './routes/waterRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// Database connection middleware
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  next();
});

// Security middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  })
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Water Dashboard API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT ;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;