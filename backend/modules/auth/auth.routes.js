import express from 'express';
import { registerUser, registerOrganization, login, logout, verifyEmail } from './auth.controller.js';
import { authLimiter } from '../../core/middleware/security.js';
import { protect } from '../../core/middleware/authMiddleware.js';

const router = express.Router();

router.post('/register/user', registerUser);
router.post('/register/organization', registerOrganization);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.get('/verify-email/:token', verifyEmail);

export default router;
