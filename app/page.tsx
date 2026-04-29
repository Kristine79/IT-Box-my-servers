import { Hero } from '@/components/landing/Hero';
import { FeaturesBento } from '@/components/landing/FeaturesBento';
import { SecurityTrust } from '@/components/landing/SecurityTrust';
import { PricingPreview } from '@/components/landing/PricingPreview';
import { CTASection } from '@/components/landing/CTASection';
import { LandingLayout } from '@/components/landing/LandingLayout';

export default function LandingPage() {
  return (
    <LandingLayout>
      <Hero />
      <FeaturesBento />
      <SecurityTrust />
      <PricingPreview />
      <CTASection />
    </LandingLayout>
  );
}
