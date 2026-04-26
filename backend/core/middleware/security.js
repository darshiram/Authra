import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';

// Basic rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Stricter rate limiting for auth routes (brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 failed attempts per hour
  message: 'Too many login attempts, please try again after an hour'
});

// Configure Helmet for secure HTTP headers
export const configureHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://img.youtube.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });
};

// Prevent NoSQL injection
export const mongoSanitizer = () => mongoSanitize();

// Rate limiting for critical actions (e.g., banning users, revoking certs)
export const criticalActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 critical actions per hour
  message: 'Too many critical actions performed from this IP, please try again after an hour'
});

// Simple anomaly detection middleware
export const anomalyDetection = async (req, res, next) => {
  try {
    const userIP = req.ip;
    const userAgent = req.headers['user-agent'];
    const userId = req.user ? req.user._id : null;

    if (!userId) return next();

    // In a real scenario, this would query Redis/DB to detect unusual patterns
    // e.g. logging in from 5 different IPs in 10 minutes, or a sudden burst of writes.
    // For now, we'll attach a flag to req if the User-Agent is suspiciously missing
    if (!userAgent) {
      console.warn(`Anomaly detected: Missing User-Agent for user ${userId} at IP ${userIP}`);
      req.audit = req.audit || {};
      req.audit.notes = (req.audit.notes || '') + ' [Anomaly: Missing User-Agent]';
    }

    next();
  } catch (error) {
    next();
  }
};
