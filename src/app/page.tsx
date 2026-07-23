import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { PainPoints } from '@/components/landing/PainPoints';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { ShadowAuditSection } from '@/components/landing/ShadowAuditSection';
import { Pricing } from '@/components/landing/Pricing';
import { ROIStats } from '@/components/landing/ROIStats';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main className="bg-cargoiq-navy">
      <Hero />
      <PainPoints />
      <HowItWorks />
      <FeaturesGrid />
      <ShadowAuditSection />
      <Pricing />
      <ROIStats />
      <Footer />
    </main>
  );
}
