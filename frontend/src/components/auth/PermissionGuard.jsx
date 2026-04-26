import React from 'react';
import { useAuth } from '../../context/AuthContext';

const PermissionGuard = ({ permission, children, fallback = null }) => {
  const { checkPermission } = useAuth();

  if (!checkPermission(permission)) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;
