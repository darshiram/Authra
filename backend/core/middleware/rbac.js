// backend/core/middleware/rbac.js

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  ORG_OWNER: 'organization_owner',
  ORG_STAFF: 'organization_staff',
  USER: 'user',
};

export const PERMISSIONS = {
  USERS_READ: 'users.read',
  USERS_WRITE: 'users.write',
  USERS_BAN: 'users.ban',
  ORGS_READ: 'orgs.read',
  ORGS_WRITE: 'orgs.write',
  ORGS_BAN: 'orgs.ban',
  CERTS_REVOKE: 'certs.revoke',
  BILLING_MANAGE: 'billing.manage',
  AUDIT_READ: 'audit.read',
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.USERS_BAN,
    PERMISSIONS.ORGS_READ,
    PERMISSIONS.ORGS_WRITE,
    PERMISSIONS.ORGS_BAN,
    PERMISSIONS.CERTS_REVOKE,
    PERMISSIONS.BILLING_MANAGE,
    PERMISSIONS.AUDIT_READ,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.ORGS_READ,
    PERMISSIONS.ORGS_WRITE,
    PERMISSIONS.CERTS_REVOKE,
  ],
  [ROLES.ORG_OWNER]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.ORGS_READ,
    PERMISSIONS.BILLING_MANAGE,
  ],
  [ROLES.ORG_STAFF]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.ORGS_READ,
  ],
  [ROLES.USER]: [
    PERMISSIONS.USERS_READ, 
  ]
};

// Middleware to check if user has a required permission
export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userRole = req.user.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        message: 'Forbidden: You do not have the required permissions to perform this action.' 
      });
    }

    next();
  };
};

// Utility to check permissions programmatically
export const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};
