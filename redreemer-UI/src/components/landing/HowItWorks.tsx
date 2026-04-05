import { MessageSquare, MapPin, TrendingUp } from 'lucide-react';

const cards = [
  {
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
    Icon: MessageSquare, iconBg: 'bg-primary/15 text-primary',
    step: '01', title: 'Text Anything',
    body: 'Text our number from any phone. Our AI meets you where you are, whether you need shelter tonight or help understanding your paycheck.',
  },
  {
    img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600',
    Icon: MapPin, iconBg: 'bg-secondary/15 text-secondary',
    step: '02', title: 'Get Real Help',
    body: 'We find real shelters, food banks, and reentry programs near you with actual addresses and phone numbers. Not generic advice. Real places.',
  },
  {
    img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600',
    Icon: TrendingUp, iconBg: 'bg-accent/15 text-accent',
    step: '03', title: 'Build Your Future',
    body: 'As you stabilize, we walk you through budgeting, avoiding predatory lenders, building credit, and saving for your first apartment.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase mb-3">How It Works</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4">Three steps. One number. Real change.</h2>
        <p className="text-muted-foreground text-lg">No downloads. No accounts. No barriers.</p>
      </div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <div key={c.step} className="glass-card group">
            <div className="rounded-2xl overflow-hidden h-48 mb-5 relative">
              <img src={c.img} alt={c.title} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-background/40" />
            </div>
            <div className={`w-12 h-12 rounded-full ${c.iconBg} flex items-center justify-center mb-4`}>
              <c.Icon size={20} />
            </div>
            <span className="font-mono text-xs text-muted-foreground">{c.step}</span>
            <h3 className="font-heading font-bold text-xl text-foreground mt-1 mb-2">{c.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
