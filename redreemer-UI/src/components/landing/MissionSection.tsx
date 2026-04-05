import { ArrowRight } from 'lucide-react';

export default function MissionSection() {
  return (
    <section id="mission" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1600" alt="Mission" className="w-full h-full object-cover" loading="lazy" />
        {/* Darker overlay so text is readable */}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.72)' }} />
      </div>
      <div className="relative z-10 max-w-[800px] mx-auto text-center">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-6" style={{ color: '#f5e000' }}>Our Mission</p>
        <h2 className="font-heading font-extrabold text-4xl md:text-6xl text-white leading-tight mb-6">
          <span style={{
            background: 'linear-gradient(90deg, #f5e000 0%, #ff6b00 60%, #e53935 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Financial exclusion is a design problem.</span>{' '}
          <span className="text-white">We're redesigning it.</span>
        </h2>
        <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8">
          Every financial app assumes you have a smartphone, an email address, a bank account. We built Redreemer for the 582,000 Americans experiencing homelessness tonight and the 600,000 released from prison each year.
        </p>
        <button
          onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg text-gray-900 hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(90deg, #f5e000, #ff6b00)' }}>
          Join the Movement <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
