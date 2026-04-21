import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/authra pfp.png';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-divider pt-16 pb-8 mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src={logo} alt="Authra Logo" className="w-8 h-8 rounded-full object-cover" />
              <span className="font-display font-bold text-xl text-main">Authra</span>
            </Link>
            <p className="text-secondary max-w-sm mb-8 leading-relaxed">
              The next-generation certificate SaaS platform. Issue, verify, and showcase achievements with absolute security.
            </p>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-main mb-6">Product</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/features" className="text-secondary hover:text-iceblue transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-secondary hover:text-iceblue transition-colors">Pricing</Link></li>
              <li><Link to="/verify" className="text-secondary hover:text-iceblue transition-colors">Verify Certificate</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-main mb-6">Company</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/about" className="text-secondary hover:text-iceblue transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-secondary hover:text-iceblue transition-colors">Contact</Link></li>
              <li><Link to="/legal/privacy" className="text-secondary hover:text-iceblue transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal/terms" className="text-secondary hover:text-iceblue transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-divider flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-secondary text-sm">
            © {new Date().getFullYear()} Authra. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Social Links */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
