import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImg from '../../assets/img/hero.png';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const Hero = () => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-periwinkle/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-divider mb-8">
            <span className="w-2 h-2 rounded-full bg-iceblue animate-pulse" />
            <span className="text-sm font-medium text-main">Authra v2.0 is live</span>
          </motion.div>
          
          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-display font-bold tracking-tight text-main mb-6 leading-[1.1]">
            The standard for <br />
            <span className="text-gradient">digital credentials</span>
          </motion.h1>
          
          <motion.p variants={fadeIn} className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Issue secure, verifiable certificates in seconds. Empower your organization with a modern platform built for scale, trust, and beautiful design.
          </motion.p>
          
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-20">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-[14px] bg-periwinkle text-white font-medium hover:bg-skyblue transition-colors flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(115,135,197,0.3)]">
              Start Issuing Free <ArrowRight size={18} />
            </Link>
            <Link to="/demo" className="w-full sm:w-auto px-8 py-4 rounded-[14px] bg-surface border border-divider text-main font-medium hover:bg-input transition-colors flex items-center justify-center">
              Book a Demo
            </Link>
          </motion.div>

          <motion.div variants={fadeIn} className="w-full max-w-5xl mx-auto rounded-2xl border border-divider overflow-hidden shadow-2xl relative">
             <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-10" />
             <img src={heroImg} alt="Authra Dashboard Preview" className="w-full h-auto object-cover relative z-0" onError={(e) => { e.target.style.display = 'none' }} />
             {/* Fallback if image fails or missing */}
             <div className="w-full h-64 md:h-[500px] bg-input flex items-center justify-center -z-10 absolute inset-0">
                <p className="text-secondary font-medium">Dashboard Preview</p>
             </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
