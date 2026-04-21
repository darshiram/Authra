import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useFetch } from '../hooks/useApi';

const Partners = () => {
  const { data: partners, loading, error } = useFetch('/public/partners');

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen">
      <Helmet>
        <title>Partners | Authra</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-main mb-6">Our Ecosystem</h1>
          <p className="text-lg text-secondary leading-relaxed">
            Join the world's most innovative organizations leveraging Authra's technology to secure their credentials.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            { title: 'API Access', desc: 'Direct integration into your platform with elevated rate limits.' },
            { title: 'Co-Marketing', desc: 'Joint case studies and featured placement on our ecosystem page.' },
            { title: 'Revenue Share', desc: 'Earn recurring commission for every organization you refer to Authra.' }
          ].map((benefit, i) => (
            <div key={i} className="p-8 rounded-[20px] bg-surface border border-divider">
              <h3 className="text-xl font-display font-bold text-main mb-3">{benefit.title}</h3>
              <p className="text-secondary">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* DB Partners List */}
        <div className="mb-24">
          <h2 className="text-3xl font-display font-bold text-main mb-10 text-center">Featured Partners</h2>
          {loading ? (
            <div className="flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-iceblue border-t-transparent animate-spin" /></div>
          ) : error ? (
            <p className="text-center text-error">Failed to load partners.</p>
          ) : partners && partners.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {partners.map(partner => (
                <div key={partner._id} className="bg-surface border border-divider rounded-[16px] p-6 flex flex-col items-center justify-center hover:border-iceblue transition-colors">
                  <img src={partner.logoUrl} alt={partner.name} className="h-12 object-contain mb-4 filter grayscale hover:grayscale-0 transition-all" />
                  <span className="text-sm font-medium text-main">{partner.name}</span>
                  <span className="text-xs text-secondary mt-1">{partner.category}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-secondary">No partners found. Be the first!</p>
          )}
        </div>

        {/* Application CTA */}
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-surface to-input border border-divider rounded-[24px] p-10 text-center">
          <h2 className="text-2xl font-display font-bold text-main mb-4">Become a Partner</h2>
          <p className="text-secondary mb-8">Integrate Authra into your product or refer clients to earn rewards.</p>
          <a href="mailto:partners@authra.com" className="inline-block px-8 py-4 rounded-[14px] bg-periwinkle text-white font-medium hover:bg-skyblue transition-colors">
            Apply Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default Partners;
