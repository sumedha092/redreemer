import { useEffect, useRef, useState } from 'react';
import { CreditCard, Home, FileText, Key, Briefcase, Landmark, BarChart2, Award } from 'lucide-react';

const steps = [
  { icon: CreditCard, label: 'Get your ID',        sub: 'The key to everything',  milestone: false },
  { icon: Home,       label: 'Find safe shelter',   sub: 'A roof over your head',  milestone: true  },
  { icon: FileText,   label: 'Enroll in benefits',  sub: 'Food stamps, Medicaid',  milestone: false },
  { icon: Key,        label: 'Stable housing',       sub: 'Your own address',       milestone: true  },
  { icon: Briefcase,  label: 'Find employment',      sub: 'Your first paycheck',    milestone: false },
  { icon: Landmark,   label: 'Open bank account',    sub: 'Financial access',       milestone: true  },
  { icon: BarChart2,  label: 'Build financial plan', sub: 'Budget, save, grow',     milestone: false },
  { icon: Award,      label: 'Full independence',    sub: 'You made it',            milestone: true  },
];

export default function JourneySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);

  // Trigger when section scrolls into view
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Animate steps left-to-right once in view
  useEffect(() => {
    if (!inView) return;
    steps.forEach((_, i) => {
      setTimeout(() => setActiveStep(i), i * 220);
    });
  }, [inView]);

  return (
    <section ref={sectionRef} className="py-28 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase mb-3">The Journey</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4">
          We walk with you, every step.
        </h2>
        <p className="text-muted-foreground text-lg">From survival to independence.</p>
      </div>

      <div className="max-w-7xl mx-auto overflow-x-auto pb-4">
        <div className="flex items-center gap-0 min-w-[900px] px-4 pt-6 relative">
          {steps.map((s, i) => {
            const revealed = i <= activeStep;
            const lineActive = i < activeStep;

            return (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center text-center w-24">
                  {/* Step circle */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                      revealed
                        ? s.milestone
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/30'
                          : 'bg-primary text-primary-foreground'
                        : 'border-2 border-border text-muted-foreground opacity-30'
                    }`}
                    style={{ transitionDelay: `${i * 40}ms` }}
                  >
                    <s.icon className="w-5 h-5" />
                  </div>

                  {/* Labels */}
                  <span
                    className={`text-xs font-medium mt-2 transition-all duration-500 ${revealed ? 'text-foreground opacity-100 translate-y-0' : 'text-muted-foreground opacity-0 translate-y-2'}`}
                    style={{ transitionDelay: `${i * 40 + 100}ms` }}
                  >
                    {s.label}
                  </span>
                  <span
                    className={`text-[10px] transition-all duration-500 ${revealed ? 'text-muted-foreground opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: `${i * 40 + 150}ms` }}
                  >
                    {s.sub}
                  </span>
                </div>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-border relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out"
                      style={{
                        width: lineActive ? '100%' : '0%',
                        transitionDelay: `${i * 220 + 100}ms`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
