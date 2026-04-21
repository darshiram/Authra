import React, { createContext, useContext, useState, useEffect } from 'react';
import { hasPermission } from '../utils/rbac';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // In a real application, you would fetch the user from an API or local storage
  const [user, setUser] = useState({
    id: 'user1',
    name: 'Admin User',
    email: 'admin@authra.com',
    role: 'super_admin', // MOCKING ROLE FOR DEMONSTRATION
    isAuthenticated: true
  });
  
  const [loading, setLoading] = useState(false);

  const login = (userData) => {
    setUser({ ...userData, isAuthenticated: true });
  };

  const logout = () => {
    setUser({ isAuthenticated: false });
  };

  const checkPermission = (permission) => {
    return hasPermission(user?.role, permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
