import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/vertical logo.png';

const SponsorCTA = () => {
  return (
    <section className="py-20 px-4 bg-surface/50 border-y border-divider overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex-1"
        >
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-periwinkle/10 border border-periwinkle/20 text-periwinkle text-sm font-medium">
            For Enterprise
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-main mb-6">
            Sponsor an event and let Authra handle the credentials.
          </h2>
          <p className="text-lg text-secondary mb-8">
            Create a branded experience for large-scale events. Our enterprise API seamlessly connects to your registration flow to automate credential issuance for thousands of attendees.
          </p>
          <Link to="/enterprise" className="text-periwinkle hover:text-iceblue font-medium transition-colors flex items-center gap-2">
            Explore Enterprise APIs →
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex-1 flex justify-center md:justify-end"
        >
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-0 bg-iceblue/20 blur-[60px] rounded-full" />
            <img src={logo} alt="Authra Enterprise" className="relative z-10 w-full h-auto object-contain filter drop-shadow-2xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SponsorCTA;
