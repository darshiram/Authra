import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminStore, useAdminUIStore } from '../../store/adminStore';
import { Users, Building, ShieldCheck, CreditCard, LogOut, Menu, X, LayoutDashboard, Activity, Search, Bell } from 'lucide-react';
import { hasPermission, PERMISSIONS } from '../../utils/rbac';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

export default function AdminLayout() {
  const { admin, logout } = useAdminStore();
  const { sidebarOpen, toggleSidebar } = useAdminUIStore();
  const location = useLocation();
  const searchInputRef = React.useRef(null);
  
  // Cmd+K to focus search
  useKeyboardShortcut(['cmd', 'k'], () => {
    searchInputRef.current?.focus();
  });

  const allNavigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Organizations', href: '/admin/orgs', icon: Building },
    { name: 'Certificates', href: '/admin/certs', icon: ShieldCheck },
    { name: 'Subscriptions', href: '/admin/subs', icon: CreditCard },
    { name: 'Audit Logs', href: '/admin/audit', icon: Activity, permission: PERMISSIONS.AUDIT_READ },
  ];

  const navigation = allNavigation.filter(
    (item) => !item.permission || hasPermission(admin?.role, item.permission)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden transition-opacity" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-slate-800 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur">
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Authra</span>
          <button className="md:hidden text-slate-400 hover:text-white transition" onClick={toggleSidebar}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 flex flex-col h-[calc(100vh-4rem)]">
          <div className="mb-8 px-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Workspace</p>
            <div className="flex items-center space-x-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-slate-100">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{admin?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
          
          <nav className="space-y-1.5 flex-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_2px_0_0_0_#818cf8]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <item.icon className={`mr-3 flex-shrink-0 h-4 w-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-auto pt-4 border-t border-slate-800">
            <button onClick={logout} className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors group">
              <LogOut className="mr-3 h-4 w-4 text-slate-500 group-hover:text-red-400 transition-colors" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-10 sticky top-0">
          <div className="flex items-center flex-1">
            <button className="md:hidden text-gray-400 hover:text-gray-600 mr-4 transition" onClick={toggleSidebar}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="max-w-md w-full relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search anything... (Cmd+K)"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none hidden sm:flex">
                <kbd className="inline-flex items-center border border-gray-200 rounded px-2 text-xs font-sans font-medium text-gray-400 bg-white">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors rounded-full hover:bg-gray-100">
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
            <Outlet />
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}
