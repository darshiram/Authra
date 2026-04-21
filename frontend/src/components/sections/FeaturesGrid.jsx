import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Award, Globe, Lock, Cpu } from 'lucide-react';

const features = [
  { icon: <Shield />, title: 'Bank-Grade Security', desc: 'Enterprise encryption and tamper-proof technology for every issued certificate.' },
  { icon: <Zap />, title: 'Lightning Fast', desc: 'Issue thousands of certificates in seconds with our optimized bulk processing engine.' },
  { icon: <Award />, title: 'Stunning Designs', desc: 'Craft beautiful credentials with our premium template editor and custom branding.' },
  { icon: <Globe />, title: 'Global Verification', desc: '1-click instant verification from anywhere in the world, available 24/7.' },
  { icon: <Lock />, title: 'Access Control', desc: 'Granular permissions and role-based access for your entire organization.' },
  { icon: <Cpu />, title: 'API Driven', desc: 'Seamlessly integrate Authra into your existing workflows with our robust API.' }
];

const FeaturesGrid = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-main mb-6">Engineered for excellence</h2>
          <p className="text-lg text-secondary">
            Everything you need to issue, manage, and verify digital credentials at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[20px] bg-surface border border-divider hover:border-periwinkle/50 transition-all duration-300 group hover:-translate-y-1 shadow-sm hover:shadow-[0_8px_30px_rgba(115,135,197,0.1)]"
            >
              <div className="w-12 h-12 rounded-[14px] bg-input border border-divider flex items-center justify-center mb-6 text-iceblue group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-main mb-3">{feat.title}</h3>
              <p className="text-secondary leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
