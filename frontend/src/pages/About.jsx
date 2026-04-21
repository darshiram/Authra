import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Users, Target, Shield, Clock } from 'lucide-react';

const team = [
  { name: 'Alex Johnson', role: 'CEO & Founder' },
  { name: 'Sarah Chen', role: 'CTO' },
  { name: 'Marcus Rivera', role: 'Head of Design' },
  { name: 'Priya Patel', role: 'Lead Security Engineer' }
];

const About = () => {
  return (
    <div className="pt-32 pb-24 px-4 min-h-screen">
      <Helmet>
        <title>About Us | Authra</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-display font-bold text-main mb-6">
            Our Mission to Secure Digital Trust
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-secondary leading-relaxed">
            Founded in 2024, Authra was built on a simple premise: issuing and verifying credentials should be secure, instant, and beautifully designed. We are a team of cryptographers, designers, and engineers dedicated to eliminating credential fraud.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="p-8 rounded-[24px] bg-surface border border-divider">
            <Target className="w-10 h-10 text-iceblue mb-6" />
            <h3 className="text-2xl font-display font-bold text-main mb-4">The Vision</h3>
            <p className="text-secondary leading-relaxed">To create a global standard for digital portfolios where every achievement can be instantly verified without friction or doubt.</p>
          </div>
          <div className="p-8 rounded-[24px] bg-surface border border-divider">
            <Shield className="w-10 h-10 text-iceblue mb-6" />
            <h3 className="text-2xl font-display font-bold text-main mb-4">Our Values</h3>
            <p className="text-secondary leading-relaxed">Security first. Privacy always. We believe that technology should empower users while protecting their data with absolute integrity.</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-24">
          <h2 className="text-3xl font-display font-bold text-main text-center mb-12">Our Journey</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8 relative">
            <div className="hidden md:block absolute top-8 left-10 right-10 h-[1px] bg-divider" />
            {[
              { year: '2024', event: 'Authra Founded' },
              { year: '2025', event: 'Reached 1M Verifications' },
              { year: '2026', event: 'Enterprise API Launch' }
            ].map((item, i) => (
              <div key={i} className="flex-1 relative z-10 text-center">
                <div className="w-16 h-16 rounded-full bg-midnight border border-divider flex items-center justify-center mx-auto mb-4 text-iceblue font-bold">
                  <Clock size={20} />
                </div>
                <h4 className="text-xl font-display font-bold text-main mb-2">{item.year}</h4>
                <p className="text-secondary">{item.event}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-3xl font-display font-bold text-main text-center mb-12">The Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div key={i} className="bg-surface border border-divider p-6 rounded-[20px] text-center hover:border-periwinkle/50 transition-colors">
                <div className="w-20 h-20 mx-auto rounded-full bg-input mb-4 flex items-center justify-center text-secondary">
                  <Users size={32} />
                </div>
                <h4 className="font-display font-bold text-main">{member.name}</h4>
                <p className="text-sm text-secondary">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
