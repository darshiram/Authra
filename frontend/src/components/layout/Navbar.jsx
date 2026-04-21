import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/img/authra pfp.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Theme Toggle State
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Partners', path: '/partners' },
    { name: 'Sponsors', path: '/sponsors' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Authra Logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-display font-bold text-xl tracking-tight text-main">Authra</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="text-sm font-medium text-secondary hover:text-iceblue transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 text-secondary hover:text-iceblue transition-colors rounded-full"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login" className="text-sm font-medium text-secondary hover:text-iceblue transition-colors">
              Log in
            </Link>
            <Link to="/register" className="px-5 py-2.5 rounded-[14px] bg-periwinkle text-main text-sm font-medium hover:bg-skyblue transition-colors shadow-[0_4px_14px_rgba(115,135,197,0.25)]">
              Get Started
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className="p-2 text-secondary hover:text-iceblue transition-colors rounded-full"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              className="text-main p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-surface border-b border-divider md:hidden shadow-xl"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-main block p-2"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-[1px] w-full bg-divider my-2" />
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium text-main block p-2">
                Log in
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="w-full text-center mt-2 px-5 py-3 rounded-[14px] bg-periwinkle text-main font-medium">
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
