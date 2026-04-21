import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { submitForm } from '../hooks/useApi';
import { Mail, MessageSquare, MapPin, ChevronDown } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', type: 'Support', subject: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: false, message: '' });
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, message: '' });
    
    const result = await submitForm('/public/contact', formData);
    
    setStatus({
      loading: false,
      success: result.success,
      message: result.message || (result.success ? 'Message sent!' : 'Failed to send message.')
    });

    if (result.success) {
      setFormData({ name: '', email: '', type: 'Support', subject: '', message: '' });
    }
  };

  const faqs = [
    { q: 'How long does verification take?', a: 'Verifications via our API are instant. Manual verifications usually process within a few seconds of loading the unique URL.' },
    { q: 'Do you offer custom pricing for non-profits?', a: 'Yes, we offer special rates for registered non-profits and educational institutions. Please select "Sales" in the contact form.' },
    { q: 'Can I integrate Authra into my own app?', a: 'Absolutely. We provide comprehensive REST APIs and Webhooks on our Enterprise plans.' }
  ];

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen">
      <Helmet>
        <title>Contact Us | Authra</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Left Col: Info & FAQ */}
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-main mb-6">Get in touch</h1>
          <p className="text-lg text-secondary mb-12">
            Whether you have a question about pricing, need support, or want to partner with us, our team is ready to answer all your questions.
          </p>

          <div className="flex flex-col gap-6 mb-16">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-surface border border-divider flex items-center justify-center text-iceblue shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="font-bold text-main text-lg">Email Support</h4>
                <p className="text-secondary mb-1">Our team typically responds within 2 hours.</p>
                <a href="mailto:support@authra.com" className="text-iceblue hover:underline">support@authra.com</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-surface border border-divider flex items-center justify-center text-iceblue shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-bold text-main text-lg">Headquarters</h4>
                <p className="text-secondary">100 Innovation Way<br/>San Francisco, CA 94105</p>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-display font-bold text-main mb-6">Frequently Asked Questions</h3>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface border border-divider rounded-[16px] overflow-hidden">
                <button 
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-main">{faq.q}</span>
                  <ChevronDown className={`text-secondary transition-transform ${openFaq === i ? 'rotate-180' : ''}`} size={20} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-secondary text-sm">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Form */}
        <div className="bg-surface border border-divider rounded-[24px] p-8 md:p-10">
          <h3 className="text-2xl font-display font-bold text-main mb-8 flex items-center gap-3">
            <MessageSquare className="text-iceblue" /> Send a Message
          </h3>

          {status.message && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${status.success ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-input border border-divider rounded-[12px] px-4 py-3 text-main focus:outline-none focus:border-iceblue transition-colors" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-input border border-divider rounded-[12px] px-4 py-3 text-main focus:outline-none focus:border-iceblue transition-colors" placeholder="jane@company.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Inquiry Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-input border border-divider rounded-[12px] px-4 py-3 text-main focus:outline-none focus:border-iceblue transition-colors appearance-none">
                <option>Support</option>
                <option>Sales</option>
                <option>Partnership</option>
                <option>Sponsorship</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Subject</label>
              <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-input border border-divider rounded-[12px] px-4 py-3 text-main focus:outline-none focus:border-iceblue transition-colors" placeholder="How can we help?" />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Message</label>
              <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-input border border-divider rounded-[12px] px-4 py-3 text-main focus:outline-none focus:border-iceblue transition-colors min-h-[150px] resize-y" placeholder="Tell us more about your request..."></textarea>
            </div>

            <button type="submit" disabled={status.loading} className="w-full py-4 rounded-[12px] bg-periwinkle text-white font-bold hover:bg-skyblue transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {status.loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default Contact;
