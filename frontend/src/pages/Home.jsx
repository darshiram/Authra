import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/sections/Hero';
import TrustMetrics from '../components/sections/TrustMetrics';
import FeaturesGrid from '../components/sections/FeaturesGrid';
import HowItWorks from '../components/sections/HowItWorks';
import PartnersPreview from '../components/sections/PartnersPreview';
import TestimonialsPreview from '../components/sections/TestimonialsPreview';
import SponsorCTA from '../components/sections/SponsorCTA';
import FinalCTA from '../components/sections/FinalCTA';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Authra | The Standard for Digital Credentials</title>
        <meta name="description" content="Issue, verify, and showcase digital certificates securely with Authra. Enterprise-grade security with beautiful minimal design." />
      </Helmet>

      <Hero />
      <PartnersPreview />
      <TrustMetrics />
      <FeaturesGrid />
      <HowItWorks />
      <TestimonialsPreview />
      <SponsorCTA />
      <FinalCTA />
    </>
  );
};

export default Home;
