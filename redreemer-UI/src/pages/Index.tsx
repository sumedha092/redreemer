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
import AnimatedBackground from '@/components/AnimatedBackground';

export default function Index() {
  return (
    <div className="min-h-screen bg-white text-foreground scroll-smooth">
      {/* Subtle animated dot grid — fixed behind all content */}
      <AnimatedBackground variant="dots" color="#111827" opacity={0.055} />

      {/* All content sits above the canvas */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        {/* Hero — white bg, aurora glows */}
        <HeroSection />
        {/* Stats — dark navy band */}
        <StatsBanner />
        {/* How It Works — soft gray */}
        <div className="bg-gray-50">
          <HowItWorks />
        </div>
        {/* Demo — white */}
        <DemoPlayer />
        {/* Who We Serve — full-bleed images, no bg needed */}
        <WhoWeServe />
        {/* Journey — deep indigo/navy bg */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
          <JourneySection />
        </div>
        {/* Financial Tools — soft warm gray */}
        <div className="bg-gray-50">
          <FinancialTools />
        </div>
        {/* Testimonials — deep emerald-tinted dark */}
        <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' }}>
          <Testimonials />
        </div>
        {/* For Caseworkers — white */}
        <ForCaseworkers />
        {/* Mission — full-bleed photo overlay */}
        <MissionSection />
        {/* Footer — dark */}
        <Footer />
      </div>
    </div>
  );
}
