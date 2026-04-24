import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminStore, useAdminUIStore } from '../../store/adminStore';
import { Users, Building, ShieldCheck, CreditCard, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';

export default function AdminLayout() {
  const { admin, logout } = useAdminStore();
  const { sidebarOpen, toggleSidebar } = useAdminUIStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Organizations', href: '/admin/orgs', icon: Building },
    { name: 'Certificates', href: '/admin/certs', icon: ShieldCheck },
    { name: 'Subscriptions', href: '/admin/subs', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 bg-slate-950">
          <span className="text-xl font-bold">Authra Admin</span>
          <button className="md:hidden" onClick={toggleSidebar}><X className="w-6 h-6" /></button>
        </div>
        <div className="p-4">
          <div className="mb-6 px-2">
            <p className="text-sm font-medium text-gray-300">Welcome,</p>
            <p className="text-sm font-bold truncate">{admin?.name || 'Admin'}</p>
            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-gray-400 mt-1 inline-block capitalize">{admin?.role?.replace('_', ' ')}</span>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-4">
          <button onClick={logout} className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-slate-800 hover:text-red-300 transition-colors">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={toggleSidebar}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 flex justify-end">
            {/* Add global search or notifications here in the future */}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
