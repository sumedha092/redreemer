import { CheckCircle } from 'lucide-react';

const testimonials = [
  {
    initial: 'M', color: 'bg-primary', name: 'Marcus', location: 'Phoenix, AZ',
    badge: 'Homeless to housed in 6 weeks',
    quote: "I didn't have a smartphone. I didn't have internet. I just had an old flip phone. I texted that number and within 10 minutes I had a bed for the night.",
  },
  {
    initial: 'J', color: 'bg-secondary', name: 'James', location: 'Phoenix, AZ',
    badge: 'Released to employed in 4 weeks',
    quote: "I got out with $40 and a bus ticket. The AI walked me through everything and warned me about a payday lender that would have taken half my first paycheck.",
  },
  {
    initial: 'D', color: 'bg-purple-500', name: 'Darnell', location: 'Phoenix, AZ',
    badge: 'Step 2 to Step 5 in 3 months',
    quote: "My caseworker could see my progress every day. When I got stuck, she messaged me directly. I never felt alone in this.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase mb-3">Real Stories</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-foreground">Real change.</h2>
      </div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 ${t.color} rounded-full flex items-center justify-center font-heading font-bold text-foreground text-lg`}>{t.initial}</div>
              <div>
                <div className="font-heading font-bold text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.location}</div>
              </div>
            </div>
            <div className="glass inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-accent mb-4">
              <CheckCircle className="w-3 h-3" /> {t.badge}
            </div>
            <p className="text-foreground/80 text-sm italic leading-relaxed">"{t.quote}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}
