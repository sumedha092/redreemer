import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, MapPin } from 'lucide-react';

interface Step {
  time: number;
  type: 'message' | 'timeskip' | 'final';
  role?: 'user' | 'ai';
  text?: string;
  label?: string;
  stats?: { users: number; messages: number; score: number; steps: number };
}

const STEPS: Step[] = [
  { time: 0,    type: 'message', role: 'user', text: 'help', stats: { users: 0, messages: 0, score: 0, steps: 0 } },
  { time: 1500, type: 'message', role: 'ai',   text: "Hey. I'm Redreemer. I'm here to help you get back on your feet. Do you have a safe place to sleep tonight?", stats: { users: 1, messages: 1, score: 0, steps: 0 } },
  { time: 3000, type: 'message', role: 'user', text: 'no im on the street in phoenix az', stats: { users: 1, messages: 2, score: 0, steps: 0 } },
  { time: 5000, type: 'message', role: 'ai',   text: 'Found 2 shelters open now:\n• Human Services Campus, 204 S 12th Ave\n• St. Vincent de Paul, 420 W Watkins St\nCan you get to either of these?', stats: { users: 1, messages: 4, score: 5, steps: 0 } },
  { time: 7000, type: 'message', role: 'user', text: 'thank you i am going there now', stats: { users: 1, messages: 5, score: 8, steps: 1 } },
  { time: 8500, type: 'timeskip', label: '2 weeks later...', stats: { users: 1, messages: 12, score: 20, steps: 1 } },
  { time: 10000, type: 'message', role: 'user', text: 'i got housing', stats: { users: 1, messages: 13, score: 35, steps: 2 } },
  { time: 11500, type: 'timeskip', label: '6 weeks later...', stats: { users: 1, messages: 24, score: 48, steps: 3 } },
  { time: 13000, type: 'message', role: 'user', text: 'i got a job at dollar general', stats: { users: 1, messages: 25, score: 62, steps: 4 } },
  { time: 15000, type: 'message', role: 'ai',   text: 'Congrats! That is huge. Does your employer offer health insurance? This could save you thousands.', stats: { users: 1, messages: 26, score: 65, steps: 5 } },
  { time: 17000, type: 'timeskip', label: '3 months later...', stats: { users: 1, messages: 48, score: 80, steps: 6 } },
  { time: 18500, type: 'final', text: 'You have reached full independence.', stats: { users: 1, messages: 52, score: 94, steps: 8 } },
];

const CHAPTERS = [
  { label: 'Day 1 — First Contact', step: 0 },
  { label: 'Week 2 — Shelter Found', step: 5 },
  { label: 'Week 6 — Employment', step: 7 },
  { label: 'Month 3 — Independence', step: 10 },
];

export default function DemoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [visibleMessages, setVisibleMessages] = useState<Step[]>([]);
  const [stats, setStats] = useState({ users: 0, messages: 0, score: 0, steps: 0 });
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalDuration = 24000;

  function clearAll() {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function reset() {
    clearAll();
    setIsPlaying(false);
    setCurrentStep(-1);
    setVisibleMessages([]);
    setStats({ users: 0, messages: 0, score: 0, steps: 0 });
    setProgress(0);
  }

  function play(fromProgress = 0) {
    clearAll();
    setIsPlaying(true);
    startTimeRef.current = Date.now() - (fromProgress / 100) * totalDuration;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min((elapsed / totalDuration) * 100, 100));
      if (elapsed >= totalDuration) {
        clearAll();
        setIsPlaying(false);
        // Auto-loop after 1.5s
        setTimeout(() => {
          setCurrentStep(-1);
          setVisibleMessages([]);
          setStats({ users: 0, messages: 0, score: 0, steps: 0 });
          setProgress(0);
          play(0);
        }, 1500);
      }
    }, 50);

    const elapsed = (fromProgress / 100) * totalDuration;
    STEPS.forEach((step, i) => {
      if (step.time > elapsed) {
        const t = setTimeout(() => {
          setCurrentStep(i);
          if (step.stats) setStats(step.stats);
          if (step.type === 'message' || step.type === 'final' || step.type === 'timeskip') {
            setVisibleMessages(prev => [...prev, step]);
          }
        }, step.time - elapsed);
        timerRef.current.push(t);
      }
    });
  }

  function pause() {
    clearAll();
    setIsPlaying(false);
  }

  function jumpToChapter(stepIdx: number) {
    reset();
    setTimeout(() => {
      const upTo = STEPS.slice(0, stepIdx + 1);
      const msgs = upTo.filter(s => s.type === 'message' || s.type === 'timeskip' || s.type === 'final');
      setVisibleMessages(msgs);
      const last = upTo[upTo.length - 1];
      if (last?.stats) setStats(last.stats);
      setCurrentStep(stepIdx);
      const p = (STEPS[stepIdx].time / totalDuration) * 100;
      setProgress(p);
      play(p);
    }, 50);
  }

  // Auto-play on mount
  useEffect(() => {
    const t = setTimeout(() => play(0), 800);
    return () => {
      clearTimeout(t);
      clearAll();
    };
  }, []);

  const scoreCircumference = 2 * Math.PI * 28;
  const scoreOffset = scoreCircumference - (stats.score / 100) * scoreCircumference;

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase mb-3">SEE IT IN ACTION</p>
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4">
            From the street to stability.<br />
            <span className="text-gradient-amber">Watch how it works.</span>
          </h2>
          <p className="text-muted-foreground">A real journey, compressed into 24 seconds.</p>
        </div>

        {/* Player */}
        <div className="glass-card !p-0 overflow-hidden">
          <div className="grid md:grid-cols-5 min-h-[480px]">
            {/* Phone mockup — left 40% */}
            <div className="md:col-span-2 border-r border-border p-6 flex flex-col">
              <div className="text-xs text-muted-foreground font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Redreemer SMS
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px]">
                {visibleMessages.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm mt-16">
                    <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center animate-pulse">
                      <Play size={20} className="text-primary" />
                    </div>
                    Starting...
                  </div>
                )}
                {visibleMessages.map((msg, i) => (
                  <div key={i} className="animate-fade-in">
                    {msg.type === 'timeskip' && (
                      <div className="text-center py-2">
                        <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">{msg.label}</span>
                      </div>
                    )}
                    {msg.type === 'message' && (
                      <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs whitespace-pre-line ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'glass text-foreground rounded-tl-sm'}`}>
                          {msg.text}
                        </div>
                      </div>
                    )}
                    {msg.type === 'final' && (
                      <div className="text-center py-3">
                        <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 text-accent text-xs font-semibold px-4 py-2 rounded-full">
                          <span>★</span> {msg.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard mockup — right 60% */}
            <div className="md:col-span-3 p-6 space-y-4">
              <div className="text-xs text-muted-foreground font-medium mb-2">Live Dashboard</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Users Helped', value: stats.users },
                  { label: 'Messages Sent', value: stats.messages },
                  { label: 'Steps Completed', value: stats.steps },
                ].map(s => (
                  <div key={s.label} className="bg-muted/50 rounded-xl p-3 text-center">
                    <div className="font-mono text-2xl text-primary font-bold transition-all duration-500">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
                {/* Health score ring */}
                <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                      <circle cx="32" cy="32" r="28" fill="none"
                        stroke={stats.score >= 70 ? '#10B981' : stats.score >= 40 ? '#F59E0B' : '#EF4444'}
                        strokeWidth="5"
                        strokeDasharray={scoreCircumference}
                        strokeDashoffset={scoreOffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-foreground">{stats.score}</span>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Health Score</div>
                    <div className="text-xs font-medium text-foreground mt-0.5">
                      {stats.score >= 70 ? 'Strong' : stats.score >= 40 ? 'Building' : 'Starting'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step tracker */}
              <div className="bg-muted/50 rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-2">Journey Progress</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="flex items-center flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${i < stats.steps ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {i + 1}
                      </div>
                      {i < 7 && <div className={`flex-1 h-0.5 transition-all duration-500 ${i < stats.steps - 1 ? 'bg-accent' : 'bg-muted'}`} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="border-t border-border p-4">
            {/* Progress bar */}
            <div className="relative h-2 bg-muted rounded-full mb-3 cursor-pointer" onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const p = ((e.clientX - rect.left) / rect.width) * 100;
              setProgress(p);
            }}>
              <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
              {/* Chapter markers */}
              {CHAPTERS.map((ch, i) => (
                <div key={i} className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/60 border border-background"
                  style={{ left: `${(STEPS[ch.step].time / totalDuration) * 100}%` }}
                  title={ch.label}
                />
              ))}
            </div>

            {/* Chapter buttons */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {CHAPTERS.map((ch, i) => (
                <button key={i} onClick={() => jumpToChapter(ch.step)}
                  className="text-[10px] whitespace-nowrap px-2 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors flex-shrink-0">
                  {ch.label}
                </button>
              ))}
            </div>

            {/* Play controls */}
            <div className="flex items-center justify-center gap-3">
              <button onClick={reset} className="w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <RotateCcw size={16} />
              </button>
              <button onClick={isPlaying ? pause : () => play(progress)}
                className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:glow-amber transition-all shadow-lg">
                {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>
              <div className="w-9 h-9" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
