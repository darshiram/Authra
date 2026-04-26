import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Partners from './pages/Partners';
import Sponsors from './pages/Sponsors';
import Testimonials from './pages/Testimonials';
import SecuritySettings from './pages/SecuritySettings';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PERMISSIONS } from './utils/rbac';

// Admin Panel Components
import AdminLayout from './components/admin/AdminLayout';
import PermissionGuard from './components/auth/PermissionGuard';

// Lazy load admin pages for performance
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const OrgsPage = lazy(() => import('./pages/admin/OrgsPage'));
const CertsPage = lazy(() => import('./pages/admin/CertsPage'));
const SubsPage = lazy(() => import('./pages/admin/SubsPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
          <Routes>
            {/* Public routes with Navbar/Footer */}
            <Route element={
              <div className="min-h-screen flex flex-col font-sans">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/partners" element={<Partners />} />
                    <Route path="/sponsors" element={<Sponsors />} />
                    <Route path="/testimonials" element={<Testimonials />} />
                    <Route path="/settings/security" element={<SecuritySettings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }>
              <Route path="/*" />
            </Route>

            {/* Admin Panel — own layout, no Navbar/Footer */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="orgs" element={<OrgsPage />} />
              <Route path="certs" element={<CertsPage />} />
              <Route path="subs" element={<SubsPage />} />
              <Route path="audit" element={
                <PermissionGuard permission={PERMISSIONS.AUDIT_READ} fallback={<div className="p-8 text-center text-gray-500">Access Denied</div>}>
                  <AuditLogsPage />
                </PermissionGuard>
              } />
            </Route>
          </Routes>
        </Router>
        </ToastProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
