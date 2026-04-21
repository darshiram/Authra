import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useFetch } from '../hooks/useApi';
import { CheckCircle, Download } from 'lucide-react';

const Sponsors = () => {
  const { data: sponsors, loading, error } = useFetch('/public/sponsors');

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen">
      <Helmet>
        <title>Sponsorships | Authra</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-main mb-6">Sponsor Authra Events</h1>
          <p className="text-lg text-secondary leading-relaxed">
            Reach millions of verified professionals. Sponsor our global credentialing events and integrate your brand directly into the portfolios of top talent.
          </p>
        </div>

        {/* Audience Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 bg-surface/30 p-10 rounded-[24px] border border-divider">
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-iceblue mb-2">5M+</p>
            <p className="text-sm text-secondary uppercase tracking-wider">Professionals</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-iceblue mb-2">150+</p>
            <p className="text-sm text-secondary uppercase tracking-wider">Countries</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-iceblue mb-2">68%</p>
            <p className="text-sm text-secondary uppercase tracking-wider">Decision Makers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-iceblue mb-2">12M</p>
            <p className="text-sm text-secondary uppercase tracking-wider">Monthly Views</p>
          </div>
        </div>

        {/* Tiers */}
        <div className="mb-24">
          <h2 className="text-3xl font-display font-bold text-main text-center mb-12">Sponsorship Tiers</h2>
          
          {loading ? (
             <div className="flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-iceblue border-t-transparent animate-spin" /></div>
          ) : error ? (
            <p className="text-center text-error">Failed to load sponsor tiers.</p>
          ) : sponsors && sponsors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sponsors.map(tier => (
                <div key={tier._id} className="bg-surface border border-divider rounded-[24px] p-8 relative overflow-hidden flex flex-col">
                  {tier.tier === 'Platinum' && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-iceblue via-skyblue to-periwinkle" />}
                  <h3 className="text-2xl font-display font-bold text-main mb-2">{tier.tier}</h3>
                  <div className="text-3xl font-bold text-main mb-8">${tier.price.toLocaleString()}<span className="text-base text-secondary font-normal">/event</span></div>
                  
                  <ul className="flex flex-col gap-4 mb-10 flex-grow">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3 text-secondary text-sm">
                        <CheckCircle className="w-5 h-5 text-iceblue shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className="w-full py-3 rounded-[12px] bg-input text-main font-medium hover:bg-white/10 transition-colors">
                    Inquire Now
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-secondary">Tiers are currently being updated.</p>
          )}
        </div>

        {/* Media Kit CTA */}
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-surface to-[#1a1f33] border border-divider rounded-[24px] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-display font-bold text-main mb-2">Download Media Kit</h3>
            <p className="text-secondary">Get detailed demographics, case studies, and exact ad placements.</p>
          </div>
          <button className="shrink-0 px-6 py-3 rounded-[12px] bg-iceblue text-midnight font-bold flex items-center gap-2 hover:bg-skyblue transition-colors">
            <Download size={20} /> Media Kit 2026 (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sponsors;
