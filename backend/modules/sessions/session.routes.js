import express from 'express';
import { protect } from '../../core/middleware/authMiddleware.js';
import { 
  getActiveSessions, 
  getLoginHistory, 
  getSecurityAlerts, 
  logoutDevice, 
  logoutAllExceptCurrent 
} from './session.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/active', getActiveSessions);
router.get('/history', getLoginHistory);
router.get('/alerts', getSecurityAlerts);
router.delete('/:sessionId', logoutDevice);
router.delete('/', logoutAllExceptCurrent);

export default router;
