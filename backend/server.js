import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import publicRoutes from './routes/publicRoutes.js';
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import sessionRoutes from './modules/sessions/session.routes.js';
import { apiLimiter, mongoSanitizer, configureHelmet } from './core/middleware/security.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json({ limit: '10kb' })); // Body parser
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(configureHelmet());
app.use(mongoSanitizer()); // Data sanitization against NoSQL query injection
app.use('/api', apiLimiter); // Apply rate limiter to all API routes

// Routes
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/sessions', sessionRoutes);


// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', message: 'Authra Public API running' }));

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/authra');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();
