import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../utils/rbac';
import { Users, Settings, BarChart2, CreditCard, Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user, checkPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={20} />, permission: null },
    { id: 'users', label: 'User Management', icon: <Users size={20} />, permission: PERMISSIONS.USERS_READ },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={20} />, permission: PERMISSIONS.ANALYTICS_VIEW },
    { id: 'billing', label: 'Billing & Subscriptions', icon: <CreditCard size={20} />, permission: PERMISSIONS.BILLING_MANAGE },
    { id: 'org', label: 'Organization Settings', icon: <Settings size={20} />, permission: PERMISSIONS.ORG_MANAGE },
    { id: 'admins', label: 'Admin Roles', icon: <Shield size={20} />, permission: PERMISSIONS.ADMINS_MANAGE },
  ];

  // Filter menu items based on user permissions
  const authorizedMenu = menuItems.filter(item => 
    !item.permission || checkPermission(item.permission)
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
            <Lock className="w-6 h-6" />
            Admin Panel
          </h2>
          <div className="mt-4 px-3 py-2 bg-indigo-950/30 rounded-lg border border-indigo-900/50">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-indigo-400 mt-1 capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {authorizedMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-white capitalize mb-2">
            {authorizedMenu.find(m => m.id === activeTab)?.label}
          </h1>
          <p className="text-gray-400 mb-8">Manage your system {activeTab} securely.</p>
          
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-16 h-16 text-indigo-500/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300">Protected Content</h3>
              <p className="text-gray-500 mt-2 max-w-sm">
                You are viewing this content because your role ({user.role}) has the required permissions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
