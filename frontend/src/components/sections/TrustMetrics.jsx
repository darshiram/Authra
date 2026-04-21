import React from 'react';

const TrustMetrics = () => {
  return (
    <section className="py-12 border-y border-divider bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Users Verified', value: '2M+' },
            { label: 'Certificates', value: '5M+' },
            { label: 'Uptime', value: '99.99%' },
            { label: 'Integrations', value: '150+' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-5xl font-display font-bold text-main mb-2">{stat.value}</p>
              <p className="text-sm text-secondary font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustMetrics;
