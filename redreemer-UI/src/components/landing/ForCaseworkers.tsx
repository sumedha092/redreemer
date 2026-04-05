import { Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  'Real-time conversation history',
  'Financial Health Score per client',
  'Step progress and milestone tracking',
  'AI voice milestone celebrations',
  'Direct message composer',
  'Progress report export for grants',
];

export default function ForCaseworkers() {
  const navigate = useNavigate();

  return (
    <section className="py-28 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-medium mb-6">
            <Users size={14} /> For Social Workers and Nonprofits
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">Your clients, always in view.</h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-8">
            The Redreemer dashboard gives you real-time visibility into every client's journey. See who is progressing, who has gone quiet, and who needs a human touch.
          </p>
          <div className="space-y-3 mb-8">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-foreground text-sm">
                <CheckCircle size={16} className="text-primary shrink-0" /> {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:glow-amber transition-all"
          >
            Request Dashboard Access <ArrowRight size={16} />
          </button>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(245,158,11,0.1)', filter: 'blur(60px)', borderRadius: '50%' }} />
          <div className="relative glass rounded-2xl p-6 border border-border">
            <div className="flex gap-1.5 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ name: 'Marcus', pct: 50 }, { name: 'James', pct: 37 }, { name: 'Darnell', pct: 25 }].map((c) => (
                <div key={c.name} className="glass rounded-lg p-3">
                  <div className="text-xs font-heading font-bold text-foreground">{c.name}</div>
                  <div className="h-1.5 rounded bg-primary/30 mt-2"><div className="h-full bg-primary rounded" style={{ width: `${c.pct}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2" className="stroke-border" />
                  <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2" strokeDasharray="65 35" className="stroke-primary" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-primary text-sm font-bold">52</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
