import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  { quote: "Authra transformed how we issue credentials. We went from spending weeks to mere seconds on bulk uploads. The platform is incredibly fast and intuitive.", author: "Sarah Jenkins", role: "Director of Education, TechInstitute" },
  { quote: "The tamper-proof verification gives our students the absolute confidence they need when sharing their portfolios on LinkedIn. Highly recommended.", author: "David Chen", role: "Founder, CodeCamp" },
  { quote: "Beautiful UI, rock-solid API, and phenomenal support. Integrating Authra into our custom LMS took less than a day.", author: "Elena Rodriguez", role: "CTO, LearnSphere" }
];

const TestimonialsPreview = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((current + 1) % testimonials.length);
  const prev = () => setCurrent((current - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 px-4 bg-surface/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-main mb-6">Loved by thousands</h2>
        </div>

        <div className="relative bg-surface border border-divider rounded-[24px] p-8 md:p-16 overflow-hidden">
          <Quote className="absolute top-8 left-8 w-24 h-24 text-divider opacity-50 -z-10" />
          
          <div className="min-h-[200px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center z-10"
              >
                <p className="text-xl md:text-3xl text-main font-medium leading-relaxed mb-8 max-w-3xl mx-auto">
                  "{testimonials[current].quote}"
                </p>
                <div>
                  <h4 className="font-display font-bold text-lg text-iceblue">{testimonials[current].author}</h4>
                  <p className="text-secondary">{testimonials[current].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={prev} className="p-3 rounded-full bg-input hover:bg-white/10 transition-colors text-main border border-divider">
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-periwinkle w-8' : 'bg-divider'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button onClick={next} className="p-3 rounded-full bg-input hover:bg-white/10 transition-colors text-main border border-divider">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsPreview;
