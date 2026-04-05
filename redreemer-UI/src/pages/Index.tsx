import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsBanner from '@/components/landing/StatsBanner';
import HowItWorks from '@/components/landing/HowItWorks';
import DemoPlayer from '@/components/DemoPlayer';
import WhoWeServe from '@/components/landing/WhoWeServe';
import JourneySection from '@/components/landing/JourneySection';
import FinancialTools from '@/components/landing/FinancialTools';
import Testimonials from '@/components/landing/Testimonials';
import ForCaseworkers from '@/components/landing/ForCaseworkers';
import MissionSection from '@/components/landing/MissionSection';
import Footer from '@/components/landing/Footer';

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <Navbar />
      <HeroSection />
      <StatsBanner />
      <HowItWorks />
      <DemoPlayer />
      <WhoWeServe />
      <JourneySection />
      <FinancialTools />
      <Testimonials />
      <ForCaseworkers />
      <MissionSection />
      <Footer />
    </div>
  );
}
