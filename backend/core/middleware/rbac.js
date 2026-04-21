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
  ORG_MANAGE: 'org.manage',
  BILLING_MANAGE: 'billing.manage',
  ANALYTICS_VIEW: 'analytics.view',
  ADMINS_MANAGE: 'admins.manage',
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.ORG_MANAGE,
    PERMISSIONS.BILLING_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ADMINS_MANAGE,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.ORG_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  [ROLES.ORG_OWNER]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.ORG_MANAGE,
    PERMISSIONS.BILLING_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  [ROLES.ORG_STAFF]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  [ROLES.USER]: [
    PERMISSIONS.USERS_READ, // typically can only read own user data, which should be handled in controllers
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
