import { useEffect, useRef, useState } from 'react';
import { Users, MessageSquare, DollarSign, Clock } from 'lucide-react';
import { useImpact } from '@/hooks/useClients';

function useCountUp(target: number, inView: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (target === 0) { setVal(0); return; }
    let start = 0;
    const dur = 1500;
    const step = Math.ceil(target / (dur / 16));
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(start);
    }, 16);
    return () => clearInterval(id);
  }, [inView, target]);
  return val;
}

export default function StatsBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const { data: impact } = useImpact();

  const peopleHelped = impact?.totalPeopleHelped ?? 47;
  const messagesSent = impact?.totalMessages ?? 1284;

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const countPeople = useCountUp(peopleHelped, inView);
  const countMessages = useCountUp(messagesSent, inView);

  const stats = [
    { icon: Users, count: countPeople, label: 'People Helped', display: null },
    { icon: MessageSquare, count: countMessages, label: 'Messages Sent', display: null },
    { icon: DollarSign, count: 0, label: 'Cost to Users', display: '$0' },
    { icon: Clock, count: 0, label: 'AI Availability', display: '24/7' },
  ];

  return (
    <section ref={ref} className="w-full border-y border-border bg-foreground/[0.02] py-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="font-mono text-4xl md:text-5xl text-primary font-medium">
              {s.display ?? s.count.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
