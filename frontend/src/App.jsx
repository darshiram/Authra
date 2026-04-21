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

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
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
                
                {/* Protected Admin Routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requiredPermission={PERMISSIONS.USERS_READ}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
