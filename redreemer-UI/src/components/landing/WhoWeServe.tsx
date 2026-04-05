import { Home, KeyRound } from 'lucide-react';

const cards = [
  {
    icon: Home,
    title: 'Experiencing Homelessness',
    body: 'Over 582,000 Americans are experiencing homelessness tonight. Most have no access to apps, email, or internet — but most have access to a phone that can text.',
    stat: '1 in 5 homeless individuals has no access to social services',
    gradient: 'from-primary/85 to-background/90',
    img: 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?w=800',
  },
  {
    icon: KeyRound,
    title: 'Recently Released',
    body: 'Over 600,000 people are released from prison each year. The first 90 days are the most critical — and the most underserved. We bridge that gap.',
    stat: '68% of released individuals are rearrested within 3 years',
    gradient: 'from-secondary/85 to-background/90',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  },
];

export default function WhoWeServe() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        {cards.map((c) => (
          <div key={c.title} className="relative rounded-3xl overflow-hidden h-[520px] flex items-end">
            <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className={`absolute inset-0 bg-gradient-to-t ${c.gradient}`} />
            <div className="relative z-10 p-8 md:p-10">
              <c.icon className="w-12 h-12 text-foreground mb-4" />
              <h3 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-3">{c.title}</h3>
              <p className="text-foreground/80 text-base leading-relaxed max-w-[380px] mb-4">{c.body}</p>
              <div className="glass inline-flex px-4 py-2 rounded-full text-xs text-foreground/90">{c.stat}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
