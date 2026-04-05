import { Phone, ArrowRight, ShieldCheck, Smartphone, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  function scrollToHowItWorks() {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden dot-grid grain">
      <div className="absolute top-20 right-20 w-[600px] h-[600px] rounded-full opacity-100 pointer-events-none" style={{ background: 'rgba(245,158,11,0.12)', filter: 'blur(140px)', animation: 'aurora-1 20s ease-in-out infinite alternate' }} />
      <div className="absolute bottom-20 left-20 w-[500px] h-[500px] rounded-full opacity-100 pointer-events-none" style={{ background: 'rgba(99,102,241,0.10)', filter: 'blur(140px)', animation: 'aurora-2 20s ease-in-out infinite alternate' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16 grid lg:grid-cols-2 gap-20 items-center w-full">
        <div className="max-w-[580px]">

          <h1 className="font-heading font-extrabold text-6xl md:text-[80px] leading-[1.0] tracking-tight mb-7">
            <span className="text-foreground">Redeem your</span><br />
            <span className="text-foreground">next step.</span><br />
            <span className="text-gradient-brand">Redream what's</span><br />
            <span className="text-gradient-brand">possible.</span>
          </h1>

          <p className="text-muted-foreground text-xl leading-relaxed max-w-[460px] mb-10">
            No app. No bank account. No address required. Just a text — and a path from the street to stability.
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <a href="https://wa.me/14155238886?text=join%20redreemer"
              className="flex items-center gap-2.5 px-7 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:glow-amber transition-all">
              <Phone size={20} />
              Text +1 (415) 523-8886
            </a>
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-7 py-4 rounded-xl glass text-foreground font-medium text-base hover:bg-foreground/10 transition-all"
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-8">
            First time on WhatsApp? Send <span className="font-mono font-semibold text-foreground bg-gray-100 px-1.5 py-0.5 rounded">join redreemer</span> first to activate.
          </p>

          <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-accent" /> Free forever</span>
            <span className="w-px h-3 bg-border" />
            <span className="flex items-center gap-1.5"><Smartphone size={14} /> Works on any phone</span>
            <span className="w-px h-3 bg-border" />
            <span className="flex items-center gap-1.5"><Clock size={14} /> 24/7 AI support</span>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="relative hidden lg:flex justify-center">
          <div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'rgba(245,158,11,0.12)', filter: 'blur(80px)' }} />
          <div className="relative w-[340px] rounded-[40px] border-2 border-foreground/10 overflow-hidden" style={{ background: '#1c1c1e', animation: 'float 6s ease-in-out infinite alternate' }}>
            <div className="flex items-center justify-center gap-2 py-4 border-b" style={{ background: '#1c1c1e', borderColor: '#3a3a3c' }}>
              <span className="font-heading font-bold text-white text-sm">Redreemer</span>
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-green-400">Online</span>
            </div>
            <div className="p-4 space-y-3 min-h-[480px]" style={{ background: '#000' }}>
              <div className="rounded-2xl rounded-tl-sm p-3 text-sm max-w-[85%]" style={{ background: '#3a3a3c', color: '#fff' }}>
                Hey, I'm here to help. Do you have a safe place to sleep tonight?
              </div>
              <div className="ml-auto rounded-2xl rounded-tr-sm p-3 text-sm max-w-[75%]" style={{ background: '#0a84ff', color: '#fff' }}>
                no im on the street in phoenix
              </div>
              <div className="rounded-2xl rounded-tl-sm p-3 text-sm max-w-[85%]" style={{ background: '#3a3a3c', color: '#fff' }}>
                <p className="mb-2">Found 2 shelters open right now:</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-1.5"><MapPin size={12} className="mt-0.5 shrink-0" style={{ color: '#f5e000' }} /><span>Human Services Campus<br/>204 S 12th Ave — Open 24hrs</span></div>
                  <div className="flex items-start gap-1.5"><MapPin size={12} className="mt-0.5 shrink-0" style={{ color: '#f5e000' }} /><span>St. Vincent de Paul<br/>420 W Watkins St — Open until midnight</span></div>
                </div>
                <p className="mt-2">Can you get to either of these?</p>
              </div>
              <div className="ml-auto rounded-2xl rounded-tr-sm p-3 text-sm max-w-[75%]" style={{ background: '#0a84ff', color: '#fff' }}>
                yes the first one thank you
              </div>
              <div className="rounded-2xl rounded-tl-sm p-3 text-sm max-w-[85%]" style={{ background: '#3a3a3c', color: '#fff' }}>
                Great. When you get there, ask about their ID recovery program — it's your first step toward housing.
              </div>
            </div>
            <div className="p-3 border-t" style={{ background: '#1c1c1e', borderColor: '#3a3a3c' }}>
              <div className="rounded-full py-2.5 px-4 text-xs" style={{ background: '#3a3a3c', color: '#8e8e93' }}>Type a message...</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
