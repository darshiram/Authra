import express from 'express';
import { getAllOrgs, getOrgDetails, getOrgMembers, impersonateOrg, editOrg, toggleBanOrg } from './admin.org.controller.js';
import { protect, restrictTo } from '../../core/middleware/authMiddleware.js';
import { auditAction } from '../../core/middleware/auditMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('super_admin', 'admin', 'support_admin', 'finance_admin', 'read_only_admin'), getAllOrgs);
router.get('/:id', restrictTo('super_admin', 'admin', 'support_admin', 'finance_admin', 'read_only_admin'), getOrgDetails);
router.get('/:id/members', restrictTo('super_admin', 'admin', 'support_admin', 'finance_admin', 'read_only_admin'), getOrgMembers);
router.post('/:id/impersonate', restrictTo('super_admin', 'support_admin'), auditAction('IMPERSONATE_ORG', 'Organization'), impersonateOrg);
router.patch('/:id', restrictTo('super_admin', 'admin'), auditAction('EDIT_ORG', 'Organization'), editOrg);
router.patch('/:id/ban', restrictTo('super_admin', 'admin'), auditAction('TOGGLE_BAN_ORG', 'Organization'), toggleBanOrg);

export default router;
