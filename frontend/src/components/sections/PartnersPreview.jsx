import React from 'react';
import logo from '../../assets/img/authra.png';

const PartnersPreview = () => {
  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <p className="text-sm font-medium text-secondary uppercase tracking-widest">Trusted by industry leaders</p>
      </div>
      
      {/* Infinite Carousel - simple implementation with CSS animation */}
      <div className="flex w-[200%] md:w-[150%] lg:w-[120%] animate-[slide_30s_linear_infinite] hover:[animation-play-state:paused]">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex-1 flex justify-center items-center opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 px-8">
            <img src={logo} alt="Partner Logo" className="h-10 w-auto object-contain" />
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </section>
  );
};

export default PartnersPreview;
