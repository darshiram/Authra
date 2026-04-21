import express from 'express';
import { adminLogin, verifyAdminOTP, adminLogout, setupSuperAdmin } from './admin.auth.controller.js';
import { authLimiter } from '../../core/middleware/security.js';
import { protect, restrictTo } from '../../core/middleware/authMiddleware.js';
import { requirePermission, PERMISSIONS } from '../../core/middleware/rbac.js';

const router = express.Router();

router.post('/setup', setupSuperAdmin); // Initial setup only
router.post('/login', authLimiter, adminLogin);
router.post('/verify-otp', authLimiter, verifyAdminOTP);
router.post('/logout', protect, adminLogout);

// Example protected admin routes using RBAC
router.get('/dashboard', protect, requirePermission(PERMISSIONS.ANALYTICS_VIEW), (req, res) => {
  res.json({ message: 'Welcome to the secure admin dashboard', admin: req.user });
});

router.post('/manage-admins', protect, requirePermission(PERMISSIONS.ADMINS_MANAGE), (req, res) => {
  res.json({ message: 'Admin management access granted' });
});

export default router;
