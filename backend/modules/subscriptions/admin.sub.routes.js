import express from 'express';
import { 
  getAllSubs, getSubDetails, changePlan, grantTrial, 
  pauseSubscription, resumeSubscription, cancelSubscription,
  updateLimits, setCustomPricing 
} from './admin.sub.controller.js';
import { protect, restrictTo } from '../../core/middleware/authMiddleware.js';
import { auditAction } from '../../core/middleware/auditMiddleware.js';

const router = express.Router();

router.use(protect);

// Read
router.get('/', restrictTo('super_admin', 'admin', 'support_admin', 'finance_admin', 'read_only_admin'), getAllSubs);
router.get('/:id', restrictTo('super_admin', 'admin', 'support_admin', 'finance_admin', 'read_only_admin'), getSubDetails);

// Plan changes
router.patch('/:id/plan', restrictTo('super_admin', 'finance_admin'), auditAction('CHANGE_PLAN', 'Subscription'), changePlan);

// Trial
router.post('/:id/trial', restrictTo('super_admin', 'finance_admin'), auditAction('GRANT_TRIAL', 'Subscription'), grantTrial);

// Lifecycle
router.patch('/:id/pause', restrictTo('super_admin', 'finance_admin'), auditAction('PAUSE_SUB', 'Subscription'), pauseSubscription);
router.patch('/:id/resume', restrictTo('super_admin', 'finance_admin'), auditAction('RESUME_SUB', 'Subscription'), resumeSubscription);
router.patch('/:id/cancel', restrictTo('super_admin', 'finance_admin'), auditAction('CANCEL_SUB', 'Subscription'), cancelSubscription);

// Limits
router.patch('/:id/limits', restrictTo('super_admin', 'finance_admin'), auditAction('UPDATE_LIMITS', 'Subscription'), updateLimits);

// Custom pricing
router.patch('/:id/pricing', restrictTo('super_admin', 'finance_admin'), auditAction('CUSTOM_PRICING', 'Subscription'), setCustomPricing);

export default router;
