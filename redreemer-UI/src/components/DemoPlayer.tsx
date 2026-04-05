import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, Briefcase, CheckCircle, Users, MessageSquare } from 'lucide-react';
import PhoneSimulator from './PhoneSimulator';

interface Scene {
  id: number; startMs: number; durationMs: number;
  label: string; icon: typeof Play;
  messages: { role: 'user' | 'ai'; text: string; delayMs: number }[];
  highlight?: string;
}

const SCENES: Scene[] = [
  { id: 1, startMs: 0, durationMs: 10000, label: 'Day 1 — First Contact', icon: MessageSquare, highlight: 'shelter',
    messages: [
      { role: 'user', text: "I'm homeless and I have nowhere to sleep tonight", delayMs: 500 },
      { role: 'ai', text: "I've got you. Two shelters open right now in Phoenix:\n• Human Services Campus — 204 S 12th Ave, (602) 256-6945\n• St. Vincent de Paul — 420 W Watkins St, (602) 261-6850\nCan you get to either of these?", delayMs: 2200 },
    ],
  },
  { id: 2, startMs: 10000, durationMs: 10000, label: 'Scam Alert Fires', icon: AlertTriangle, highlight: 'scam',
    messages: [
      { role: 'user', text: 'someone offered me a $500 payday loan', delayMs: 500 },
      { role: 'ai', text: "Heads up — that's a predatory lender. They charge 300-500% interest and trap people in debt cycles.\n\nSafer options:\n• Bank On certified accounts (no fees)\n• OneUnited Bank — rebuilding credit\n• Call 211 for emergency cash assistance\n\nYou deserve better than a payday trap.", delayMs: 2200 },
    ],
  },
  { id: 3, startMs: 20000, durationMs: 10000, label: 'Fair-Chance Jobs', icon: Briefcase, highlight: 'jobs',
    messages: [
      { role: 'user', text: 'I need a job but I have a record', delayMs: 500 },
      { role: 'ai', text: "These employers hire people with records:\n1. Chicanos Por La Causa — (602) 257-0700\n   Ask for workforce development\n2. Arizona@Work — (602) 506-3880\n   Free resume + interview prep\n3. Goodwill of Central AZ — (602) 371-6960\n\nYou don't have to mention your record upfront.", delayMs: 2200 },
    ],
  },
  { id: 4, startMs: 30000, durationMs: 10000, label: 'Step 4 Milestone', icon: Zap, highlight: 'milestone',
    messages: [
      { role: 'ai', text: "You just hit a milestone. Listen to that. You earned it.", delayMs: 500 },
      { role: 'ai', text: "You opened a bank account. That is not a small thing. You're on Step 4 of 8 — you're building real financial stability.", delayMs: 3000 },
    ],
  },
  { id: 5, startMs: 40000, durationMs: 10000, label: 'Caseworker View', icon: Users, highlight: 'caseworker', messages: [] },
  { id: 6, startMs: 50000, durationMs: 10000, label: 'Impact', icon: CheckCircle, highlight: 'impact', messages: [] },
];

const TOTAL_MS = 60000;

export default function DemoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<{ role: string; text: string }[]>([]);
  const [currentScene, setCurrentScene] = useState(0);
  const [liveMode, setLiveMode] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);

  function clearAll() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function reset() {
    clearAll();
    setIsPlaying(false);
    setElapsed(0);
    setVisibleMessages([]);
    setCurrentScene(0);
  }

  function play(fromMs = 0) {
    clearAll();
    setIsPlaying(true);
    setVisibleMessages([]);
    startRef.current = Date.now() - fromMs;

    intervalRef.current = setInterval(() => {
      const e = Date.now() - startRef.current;
      setElapsed(Math.min(e, TOTAL_MS));
      const idx = SCENES.findIndex((s, i) => {
        const next = SCENES[i + 1];
        return e >= s.startMs && (!next || e < next.startMs);
      });
      if (idx >= 0) setCurrentScene(idx);
      if (e >= TOTAL_MS) {
        clearAll();
        setIsPlaying(false);
        setTimeout(() => { reset(); setTimeout(() => play(0), 100); }, 2000);
      }
    }, 50);

    SCENES.forEach(scene => {
      scene.messages.forEach(msg => {
        const fireAt = scene.startMs + msg.delayMs - fromMs;
        if (fireAt > 0) {
          const t = setTimeout(() => {
            setVisibleMessages(prev => [...prev, { role: msg.role, text: msg.text }]);
          }, fireAt);
          timersRef.current.push(t);
        }
      });
    });
  }

  function jumpToScene(idx: number) {
    reset();
    const scene = SCENES[idx];
    const prevMsgs: { role: string; text: string }[] = [];
    SCENES.slice(0, idx).forEach(s => s.messages.forEach(m => prevMsgs.push({ role: m.role, text: m.text })));
    setVisibleMessages(prevMsgs);
    setCurrentScene(idx);
    setElapsed(scene.startMs);
    setTimeout(() => play(scene.startMs), 50);
  }

  useEffect(() => {
    const t = setTimeout(() => play(0), 600);
    return () => { clearTimeout(t); clearAll(); };
  }, []);

  const progress = (elapsed / TOTAL_MS) * 100;
  const scene = SCENES[currentScene];
  const stepsDone = elapsed > 40000 ? 4 : elapsed > 20000 ? 3 : elapsed > 10000 ? 2 : 1;
  const stats = {
    users: elapsed > 5000 ? 47 : Math.floor((elapsed / 5000) * 47),
    messages: elapsed > 30000 ? 1240 : Math.floor((elapsed / 30000) * 1240),
    steps: elapsed > 40000 ? 89 : Math.floor((elapsed / 40000) * 89),
    score: elapsed > 50000 ? 68 : Math.floor((elapsed / 50000) * 68),
  };

  if (liveMode) {
    return (
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">LIVE DEMO</p>
            <h2 className="font-heading font-bold text-3xl text-gray-900 mb-2">Text Redreemer right now</h2>
            <p className="text-gray-500 text-sm">This is the real AI — same as texting the actual number.</p>
          </div>
          <div className="flex justify-center mb-8">
            <button onClick={() => setLiveMode(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <RotateCcw size={14} /> Back to auto-demo
            </button>
          </div>
          <div className="flex justify-center">
            <PhoneSimulator clientId="1" clientPhone="+15550000001" clientName="Demo" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-3">SEE IT IN ACTION</p>
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            From the street to stability.<br />
            <span style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Watch how it works.
            </span>
          </h2>
          <p className="text-gray-500 text-sm">60 seconds. 6 scenes. Real AI.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-5 min-h-[500px]">

            {/* Phone */}
            <div className="md:col-span-2 border-r border-gray-100 p-6 flex flex-col bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-gray-500 font-medium">Redreemer SMS</span>
                <span className="ml-auto text-[10px] text-gray-400 font-mono">{Math.floor(elapsed / 1000)}s / 60s</span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px]">
                {visibleMessages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm mt-16">
                    <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center animate-pulse">
                      <Play size={20} className="text-gray-400" />
                    </div>
                    Starting...
                  </div>
                )}
                {visibleMessages.map((msg, i) => (
                  <div key={i} className={`flex animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs whitespace-pre-line leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-gray-900 rounded-tr-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                    }`} style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #f5e000, #ffe44d)' } : {}}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard */}
            <div className="md:col-span-3 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
                  <scene.icon size={12} className="text-gray-900" />
                </div>
                <span className="text-xs font-semibold text-gray-700">{scene.label}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'People Helped', value: stats.users },
                  { label: 'Messages Sent', value: stats.messages.toLocaleString() },
                  { label: 'Steps Completed', value: stats.steps },
                  { label: 'Avg Health Score', value: stats.score },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <div className="font-mono text-2xl font-bold text-gray-900 transition-all duration-500">{s.value}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-xs text-gray-500 font-medium mb-3">Marcus T. — Journey Progress</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="flex items-center flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-700 ${
                        i < stepsDone ? 'text-gray-900' : 'bg-gray-200 text-gray-400'
                      }`} style={i < stepsDone ? { background: 'linear-gradient(135deg, #f5e000, #ffe44d)' } : {}}>
                        {i < stepsDone ? <CheckCircle size={10} /> : i + 1}
                      </div>
                      {i < 7 && <div className={`flex-1 h-0.5 transition-all duration-700 ${i < stepsDone - 1 ? 'bg-yellow-400' : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                </div>
              </div>

              {scene.highlight === 'scam' && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200 animate-fade-in">
                  <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-red-800">Scam attempt blocked</p>
                    <p className="text-[10px] text-red-600 mt-0.5">Predatory lender detected — warning sent automatically</p>
                  </div>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">+1 blocked</span>
                </div>
              )}
              {scene.highlight === 'milestone' && (
                <div className="flex items-center gap-3 p-3 rounded-xl border animate-fade-in"
                  style={{ background: 'linear-gradient(135deg, #fefce8, #fef9c3)', borderColor: '#f5e000' }}>
                  <Zap size={16} className="text-yellow-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Step 4 complete — Bank account opened</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">Voice milestone clip sent via MMS automatically</p>
                  </div>
                </div>
              )}
              {scene.highlight === 'impact' && (
                <div className="p-4 rounded-xl border animate-fade-in text-center"
                  style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)', borderColor: '#e8c800' }}>
                  <p className="font-heading font-bold text-2xl text-gray-900">47 people helped</p>
                  <p className="text-gray-800 text-sm mt-1">$0 cost to users · 24/7 available · Works on any phone</p>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="border-t border-gray-100 p-4 bg-white">
            <div className="relative h-2 bg-gray-100 rounded-full mb-3 cursor-pointer overflow-hidden"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const p = (e.clientX - rect.left) / rect.width;
                reset();
                setTimeout(() => play(p * TOTAL_MS), 50);
              }}>
              <div className="h-full rounded-full transition-all duration-100"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #f5e000, #ffe44d)' }} />
              {SCENES.map(s => (
                <div key={s.id} className="absolute top-0 bottom-0 w-0.5 bg-gray-300"
                  style={{ left: `${(s.startMs / TOTAL_MS) * 100}%` }} />
              ))}
            </div>

            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {SCENES.map((s, i) => (
                <button key={s.id} onClick={() => jumpToScene(i)}
                  className={`flex items-center gap-1.5 text-[10px] whitespace-nowrap px-2.5 py-1.5 rounded-full transition-colors flex-shrink-0 ${
                    currentScene === i ? 'text-gray-900 font-semibold' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`} style={currentScene === i ? { background: 'linear-gradient(135deg, #f5e000, #ffe44d)' } : {}}>
                  <s.icon size={10} />
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button onClick={reset}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => { if (isPlaying) { clearAll(); setIsPlaying(false); } else { play(elapsed); } }}
                className="w-14 h-14 rounded-full flex items-center justify-center text-gray-900 hover:opacity-90 transition-all shadow-lg"
                style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
                {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>
              <button onClick={() => { clearAll(); setIsPlaying(false); setLiveMode(true); }}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Live Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
