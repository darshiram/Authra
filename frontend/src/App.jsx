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
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PERMISSIONS } from './utils/rbac';

// Admin Panel
import AdminLayout from './components/admin/AdminLayout';
import UsersPage from './pages/admin/UsersPage';
import OrgsPage from './pages/admin/OrgsPage';
import CertsPage from './pages/admin/CertsPage';
import SubsPage from './pages/admin/SubsPage';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
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
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
