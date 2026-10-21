import { Layout } from '../components/layout/Layout';
import { Hero } from '../components/landing/Hero';
import { MetricsGrid } from '../components/landing/MetricsGrid';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Roadmap } from '../components/landing/Roadmap';
import { FoundingTesterCTA } from '../components/landing/FoundingTesterCTA';


export function LandingPage() {
    
  return (
    <Layout>
      <Hero />
      <MetricsGrid />
      <HowItWorks />
      <Roadmap />
      <FoundingTesterCTA />
    </Layout>
  );
}