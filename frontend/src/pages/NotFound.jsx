import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Authra</title>
      </Helmet>
      <section className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-error/10 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <h1 className="text-8xl md:text-9xl font-display font-bold text-main mb-4 tracking-tighter">404</h1>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary mb-6">Page not found</h2>
          <p className="text-secondary max-w-md mx-auto mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="inline-flex px-8 py-4 rounded-[14px] bg-surface border border-divider text-main font-medium hover:bg-white/5 transition-colors">
            Go back home
          </Link>
        </motion.div>
      </section>
    </>
  );
};

export default NotFound;
