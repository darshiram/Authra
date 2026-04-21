import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-surface to-input border border-divider rounded-[24px] p-8 md:p-16 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-skyblue/10 blur-[100px] rounded-full pointer-events-none" />
        
        <h2 className="text-3xl md:text-5xl font-display font-bold text-main mb-6 relative z-10">
          Ready to upgrade your credentials?
        </h2>
        <p className="text-lg text-secondary mb-10 max-w-2xl mx-auto relative z-10">
          Join thousands of organizations using Authra to issue secure, beautiful certificates today.
        </p>
        
        <ul className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 relative z-10">
          {['No credit card required', '14-day free trial', 'Cancel anytime'].map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-secondary">
              <CheckCircle className="w-4 h-4 text-iceblue" />
              {item}
            </li>
          ))}
        </ul>

        <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 rounded-[14px] bg-periwinkle text-white font-bold hover:bg-skyblue transition-colors shadow-lg relative z-10">
          Create Free Account
        </Link>
      </div>
    </section>
  );
};

export default FinalCTA;
