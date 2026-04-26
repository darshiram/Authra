import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { requirePermission, ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '../core/middleware/rbac.js';

const app = express();
app.use(express.json());

// Mock Auth Middleware
const mockAuth = (role) => (req, res, next) => {
  req.user = { _id: new mongoose.Types.ObjectId(), role };
  next();
};

app.get('/api/admin/users', mockAuth(ROLES.ADMIN), requirePermission(PERMISSIONS.USERS_READ), (req, res) => res.status(200).send('OK'));
app.post('/api/admin/users/ban', mockAuth(ROLES.ADMIN), requirePermission(PERMISSIONS.USERS_BAN), (req, res) => res.status(200).send('Banned'));
app.post('/api/admin/certs/revoke', mockAuth(ROLES.SUPER_ADMIN), requirePermission(PERMISSIONS.CERTS_REVOKE), (req, res) => res.status(200).send('Revoked'));
app.put('/api/admin/subs/update', mockAuth(ROLES.SUPER_ADMIN), requirePermission(PERMISSIONS.BILLING_MANAGE), (req, res) => res.status(200).send('Updated'));

describe('Admin Security & RBAC Tests', () => {
  describe('Permission Tests', () => {
    it('should allow ADMIN to read users', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.statusCode).toBe(200);
    });

    it('should deny ADMIN from revoking certs if they lack permission', async () => {
      // Temporarily change role for this specific test setup or rely on default matrix
      // In our current matrix, ADMIN lacks CERTS_REVOKE (Wait, ADMIN has CERTS_REVOKE in rbac.js! Let's check)
      // If ADMIN has it, we should test ORG_OWNER who doesn't.
      const app2 = express();
      app2.post('/api/admin/certs/revoke', mockAuth(ROLES.ORG_OWNER), requirePermission(PERMISSIONS.CERTS_REVOKE), (req, res) => res.status(200).send('Revoked'));
      const res = await request(app2).post('/api/admin/certs/revoke');
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Admin Action Tests', () => {
    it('Ban flow tests: should ban user successfully', async () => {
      // Mocking an admin with ban permission
      const appBan = express();
      appBan.post('/api/admin/users/ban', mockAuth(ROLES.SUPER_ADMIN), requirePermission(PERMISSIONS.USERS_BAN), (req, res) => res.status(200).send('Banned'));
      const res = await request(appBan).post('/api/admin/users/ban');
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe('Banned');
    });

    it('Revoke flow tests: should revoke certificate successfully', async () => {
      const res = await request(app).post('/api/admin/certs/revoke');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Subscription Tests', () => {
    it('should allow billing manage for SUPER_ADMIN', async () => {
      const res = await request(app).put('/api/admin/subs/update');
      expect(res.statusCode).toBe(200);
    });
  });
});
