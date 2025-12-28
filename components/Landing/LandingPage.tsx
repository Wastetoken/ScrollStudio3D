import React from 'react';
import { Background } from './Background';
import { Hero } from './Hero';
import { Features } from './Features';
import { DemoPreview } from './DemoPreview';
import { Footer } from './Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <Background />
      <Hero />
      <Features />
      <DemoPreview />
      <Footer />
    </div>
  );
};
