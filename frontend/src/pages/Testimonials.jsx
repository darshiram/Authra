import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFetch } from '../hooks/useApi';
import { Star, PlayCircle } from 'lucide-react';

const Testimonials = () => {
  const { data: testimonials, loading, error } = useFetch('/public/testimonials');
  const [filter, setFilter] = useState('All');

  const filtered = testimonials ? (filter === 'All' ? testimonials : testimonials.filter(t => t.industry === filter)) : [];
  
  const industries = ['All', 'Education', 'Technology', 'Enterprise', 'General'];

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen">
      <Helmet>
        <title>Customer Stories | Authra</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-main mb-6">Customer Stories</h1>
          <p className="text-lg text-secondary leading-relaxed mb-8">
            See how organizations around the world are using Authra to secure their digital credentials.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {industries.map(ind => (
              <button 
                key={ind}
                onClick={() => setFilter(ind)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === ind ? 'bg-iceblue text-midnight' : 'bg-surface border border-divider text-secondary hover:text-main'}`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-iceblue border-t-transparent animate-spin" /></div>
        ) : error ? (
          <p className="text-center text-error">Failed to load testimonials.</p>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(testimonial => (
              <div key={testimonial._id} className="bg-surface border border-divider rounded-[20px] p-8 flex flex-col h-full">
                {/* Video Placeholder */}
                {testimonial.videoUrl ? (
                  <div className="w-full h-48 bg-input rounded-[14px] mb-6 relative flex items-center justify-center overflow-hidden group cursor-pointer">
                    <img src={`https://img.youtube.com/vi/${testimonial.videoUrl}/hqdefault.jpg`} alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" onError={(e) => e.target.style.display='none'} />
                    <PlayCircle className="w-12 h-12 text-white relative z-10 opacity-80 group-hover:scale-110 transition-transform" />
                  </div>
                ) : null}
                
                <div className="flex gap-1 mb-4 text-periwinkle">
                  {[...Array(testimonial.rating || 5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                
                <p className="text-main leading-relaxed mb-8 flex-grow">"{testimonial.quote}"</p>
                
                <div className="mt-auto pt-6 border-t border-divider">
                  <h4 className="font-display font-bold text-main">{testimonial.author}</h4>
                  <p className="text-sm text-secondary">{testimonial.role}{testimonial.company ? `, ${testimonial.company}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-secondary">No stories found for this category.</p>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
