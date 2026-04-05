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
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, MessageSquare } from 'lucide-react';

function DemoCTA() {
  const navigate = useNavigate();
  return (
    <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #f5e000 0%, #ffe44d 100%)' }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-heading font-extrabold text-4xl md:text-5xl text-gray-900 mb-4">
          See it live. Right now.
        </h2>
        <p className="text-gray-800 text-lg mb-10 max-w-xl mx-auto">
          No signup required. Click into the caseworker dashboard or try the SMS simulator — it's the real AI.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-800 transition-colors shadow-lg">
            <LayoutDashboard size={20} />
            Open Caseworker Dashboard
          </button>
          <button onClick={() => { navigate('/signup'); }}
            className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold text-base hover:bg-gray-50 transition-colors shadow-lg border border-gray-200">
            <MessageSquare size={20} />
            Try Client View
          </button>
        </div>
        <p className="text-gray-700 text-xs mt-6">Mock mode — no login needed · All data is demo data</p>
      </div>
    </section>
  );
}

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
        {/* Demo CTA — lemon yellow band */}
        <DemoCTA />
        {/* Footer — dark */}
        <Footer />
      </div>
    </div>
  );
}
