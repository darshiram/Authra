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
import adminUserRoutes from './modules/users/admin.user.routes.js';
import adminOrgRoutes from './modules/organizations/admin.org.routes.js';
import adminCertRoutes from './modules/certificates/admin.cert.routes.js';
import adminSubRoutes from './modules/subscriptions/admin.sub.routes.js';
import { apiLimiter, mongoSanitizer, configureHelmet } from './core/middleware/security.js';
import logger from './core/utils/logger.js';
import client from 'prom-client';
import { setupSwagger } from './core/utils/swagger.js';

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

// Metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'authra_' });

// Routes
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);
app.use('/api/v1/admin/orgs', adminOrgRoutes);
app.use('/api/v1/admin/certs', adminCertRoutes);
app.use('/api/v1/admin/subs', adminSubRoutes);
app.use('/api/v1/sessions', sessionRoutes);

// Metrics route
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', message: 'Authra Public API running' }));

// Swagger Docs
setupSwagger(app);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/authra');
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    app.listen(PORT, () => {
      logger.info(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

export default app;
