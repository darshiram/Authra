import express from 'express';
import { getAllUsers, getUserDetails, editUser, toggleBanUser, resetPassword, verifyUserEmail } from './admin.user.controller.js';
import { protect, restrictTo } from '../../core/middleware/authMiddleware.js';
import { auditAction } from '../../core/middleware/auditMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('super_admin', 'admin', 'support_admin', 'finance_admin', 'read_only_admin'), getAllUsers);
router.get('/:id', restrictTo('super_admin', 'admin', 'support_admin', 'finance_admin', 'read_only_admin'), getUserDetails);
router.patch('/:id', restrictTo('super_admin', 'admin', 'support_admin'), auditAction('EDIT_USER', 'User'), editUser);
router.post('/:id/reset-password', restrictTo('super_admin', 'admin', 'support_admin'), auditAction('RESET_PASSWORD', 'User'), resetPassword);
router.patch('/:id/verify', restrictTo('super_admin', 'admin', 'support_admin'), auditAction('VERIFY_USER', 'User'), verifyUserEmail);
router.patch('/:id/ban', restrictTo('super_admin', 'admin', 'support_admin'), auditAction('TOGGLE_BAN_USER', 'User'), toggleBanUser);

export default router;
