import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  { number: '01', title: 'Design & Customize', desc: 'Choose from our premium templates or upload your own background. Add dynamic data fields for personalization.' },
  { number: '02', title: 'Bulk Upload', desc: 'Upload a simple CSV or connect via API to instantly generate thousands of unique certificates in seconds.' },
  { number: '03', title: 'Issue & Verify', desc: 'Recipients get a secure link to their digital portfolio, with a 1-click verification page attached to every credential.' }
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-4 bg-surface/30 border-y border-divider">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-main mb-6">How it works</h2>
          <p className="text-lg text-secondary">
            A streamlined workflow designed to save you hours of manual effort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[1px] bg-divider z-0" />
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-midnight border-2 border-iceblue flex items-center justify-center text-xl font-display font-bold text-iceblue mb-6 shadow-[0_0_20px_rgba(168,211,232,0.2)]">
                {step.number}
              </div>
              <h3 className="text-2xl font-display font-bold text-main mb-4">{step.title}</h3>
              <p className="text-secondary leading-relaxed max-w-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
