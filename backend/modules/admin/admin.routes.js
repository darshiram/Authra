import express from 'express';
import { adminLogin, verifyAdminOTP, adminLogout, setupSuperAdmin } from './admin.auth.controller.js';
import { getAuditLogs, createAdminUser } from './admin.controller.js';
import { authLimiter } from '../../core/middleware/security.js';
import { protect, restrictTo } from '../../core/middleware/authMiddleware.js';
import { requirePermission, PERMISSIONS } from '../../core/middleware/rbac.js';

const router = express.Router();

router.post('/setup', setupSuperAdmin); // Initial setup only
router.post('/login', authLimiter, adminLogin);
router.post('/verify-otp', authLimiter, verifyAdminOTP);
router.post('/logout', protect, adminLogout);

// Example protected admin routes using RBAC
router.get('/dashboard', protect, restrictTo('super_admin', 'admin', 'support_admin', 'finance_admin', 'read_only_admin'), (req, res) => {
  res.json({ message: 'Welcome to the secure admin dashboard', admin: req.user });
});

router.post('/manage-admins', protect, restrictTo('super_admin'), createAdminUser);
router.get('/logs', protect, restrictTo('super_admin', 'admin'), getAuditLogs);

export default router;
