import express from 'express';
import { getAllCerts, getCertDetails, toggleRevokeCert, verifyCertPublic } from './admin.cert.controller.js';
import { protect, restrictTo } from '../../core/middleware/authMiddleware.js';
import { auditAction } from '../../core/middleware/auditMiddleware.js';

const router = express.Router();

// Public verification endpoint (no auth required)
router.get('/verify/:id', verifyCertPublic);

// Protected admin routes
router.use(protect);

router.get('/', restrictTo('super_admin', 'admin', 'support_admin', 'finance_admin', 'read_only_admin'), getAllCerts);
router.get('/:id', restrictTo('super_admin', 'admin', 'support_admin', 'finance_admin', 'read_only_admin'), getCertDetails);
router.patch('/:id/revoke', restrictTo('super_admin', 'admin', 'support_admin'), auditAction('TOGGLE_REVOKE_CERT', 'Certificate'), toggleRevokeCert);

export default router;
