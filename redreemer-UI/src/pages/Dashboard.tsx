import { useState, useEffect, useRef } from 'react';
import {
  Users, BarChart2, Wallet, LogOut, Search, UserPlus, AlertTriangle,
  MessageSquare, Phone, Download, ChevronRight, Play, Pause, Bell,
  Sun, Moon, X, Award, BookOpen, CheckCircle, Clock, TrendingUp,
  Shield, Target, Activity, ShieldCheck, RotateCcw, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClients, useAnalytics, useSendMessage, useUpdateStep, useAddClient, useCrisisAlerts, useRunDemo } from '@/hooks/useClients';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import Logo from '@/components/Logo';
import PhoneSimulator from '@/components/PhoneSimulator';
import ReplySpeechButton from '@/components/ReplySpeechButton';
import { API_BASE } from '@/lib/apiBase';
import { useAuth } from '@/context/AuthContext';

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

type Conversation = { role: string; content: string; created_at: string };
type StepLog = { step_number: number; completed_at: string; notes: string };
interface Client {
  id: string; name: string; user_type: string; current_step: number;
  financial_health_score: number; last_active: string; city: string;
  phone_number: string; conversations: Conversation[]; stepLogs: StepLog[];
}

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Marcus', user_type: 'homeless', current_step: 4, financial_health_score: 52,
    last_active: new Date().toISOString(), city: 'Phoenix, AZ', phone_number: '+15550000001',
    conversations: [
      { role: 'user', content: 'help', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
      { role: 'assistant', content: "Hey, I'm here to help. Do you have a safe place to sleep tonight?", created_at: new Date(Date.now() - 86400000 * 3 + 30000).toISOString() },
      { role: 'user', content: 'no im on the street in phoenix', created_at: new Date(Date.now() - 86400000 * 3 + 120000).toISOString() },
      { role: 'assistant', content: 'Found 2 shelters open now: Human Services Campus, 204 S 12th Ave. St. Vincent de Paul, 420 W Watkins St.', created_at: new Date(Date.now() - 86400000 * 3 + 180000).toISOString() },
      { role: 'user', content: 'i got my id today', created_at: new Date(Date.now() - 86400000).toISOString() },
      { role: 'assistant', content: "That's huge! Your ID unlocks everything. You're on Step 4 now.", created_at: new Date(Date.now() - 86400000 + 30000).toISOString() },
    ],
    stepLogs: [
      { step_number: 1, completed_at: new Date(Date.now() - 86400000 * 21).toISOString(), notes: 'Connected to Redreemer' },
      { step_number: 2, completed_at: new Date(Date.now() - 86400000 * 14).toISOString(), notes: 'Found shelter at Human Services Campus' },
      { step_number: 3, completed_at: new Date(Date.now() - 86400000 * 7).toISOString(), notes: 'Enrolled in SNAP benefits' },
    ]
  },
  { id: '2', name: 'James', user_type: 'reentry', current_step: 3, financial_health_score: 38,
    last_active: new Date(Date.now() - 86400000).toISOString(), city: 'Phoenix, AZ', phone_number: '+15550000002',
    conversations: [
      { role: 'user', content: 'just got out yesterday', created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
      { role: 'assistant', content: "Welcome. The first 90 days are critical. Do you have your parole check-in address?", created_at: new Date(Date.now() - 86400000 * 7 + 30000).toISOString() },
    ],
    stepLogs: [
      { step_number: 1, completed_at: new Date(Date.now() - 86400000 * 7).toISOString(), notes: 'Connected' },
      { step_number: 2, completed_at: new Date(Date.now() - 86400000 * 3).toISOString(), notes: 'Found shelter' },
    ]
  },
  { id: '3', name: 'Darnell', user_type: 'both', current_step: 2, financial_health_score: 21,
    last_active: new Date(Date.now() - 86400000 * 6).toISOString(), city: 'Phoenix, AZ', phone_number: '+15550000003',
    conversations: [],
    stepLogs: [{ step_number: 1, completed_at: new Date(Date.now() - 86400000 * 14).toISOString(), notes: 'Connected' }]
  },
  { id: '4', name: 'Alex', user_type: 'both', current_step: 3, financial_health_score: 45,
    last_active: new Date(Date.now() - 86400000 * 2).toISOString(), city: 'Phoenix, AZ', phone_number: '+15550000099',
    conversations: [], stepLogs: []
  },
];

const MOCK_ANALYTICS = {
  totalClients: 4, totalMessages: 1284, totalStepsCompleted: 8, avgHealthScore: 39,
  typeBreakdown: { homeless: 1, reentry: 1, both: 2 },
  stepsFunnel: [
    { step: 1, count: 4 }, { step: 2, count: 3 }, { step: 3, count: 2 },
    { step: 4, count: 1 }, { step: 5, count: 0 }, { step: 6, count: 0 },
    { step: 7, count: 0 }, { step: 8, count: 0 },
  ],
  activeThisWeek: 3, inactiveUsers: 1,
};

const typeColors: Record<string, string> = {
  homeless: 'bg-violet-500', reentry: 'bg-indigo-500', both: 'bg-purple-500',
};
const typeLabels: Record<string, string> = {
  homeless: 'Homeless', reentry: 'Reentry', both: 'Both',
};

function daysAgo(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

function generateReport(client: Client): string {
  const lines = [
    `REDREEMER PROGRESS REPORT`,
    `Generated: ${new Date().toLocaleString()}`,
    `${'='.repeat(40)}`,
    `Name: ${client.name}`,
    `Type: ${typeLabels[client.user_type] || client.user_type}`,
    `Current Step: ${client.current_step} of 8`,
    `Financial Health Score: ${client.financial_health_score}/100`,
    `City: ${client.city}`,
    `Phone: ${client.phone_number}`,
    `Last Active: ${new Date(client.last_active).toLocaleDateString()}`,
    ``,
    `STEP HISTORY`,
    `${'='.repeat(40)}`,
    ...client.stepLogs.map(l => `Step ${l.step_number} — ${new Date(l.completed_at).toLocaleDateString()}: ${l.notes}`),
    ``,
    `CONVERSATION HISTORY (${client.conversations.length} messages)`,
    `${'='.repeat(40)}`,
    ...client.conversations.map(c => `[${new Date(c.created_at).toLocaleString()}] ${c.role === 'user' ? 'CLIENT' : 'REDREEMER'}: ${c.content}`),
  ];
  return lines.join('\n');
}

// ── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifications = [
    { id: 1, icon: <AlertTriangle size={14} className="text-amber-400" />, text: 'Darnell has been inactive for 6 days', read: false },
    { id: 2, icon: <AlertTriangle size={14} className="text-red-400" />, text: 'Crisis alert: Darnell may need support', read: false },
    { id: 3, icon: <Award size={14} className="text-emerald-400" />, text: 'Marcus reached Step 4 — milestone', read: true },
    { id: 4, icon: <BookOpen size={14} className="text-indigo-400" />, text: 'James completed Financial Literacy Module 1', read: true },
  ];
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="relative w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
        <Bell size={16} />
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-80 glass-card !p-0 !rounded-xl overflow-hidden z-50 shadow-xl animate-fade-in">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="font-heading font-semibold text-sm text-foreground">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
          </div>
          {notifications.map(n => (
            <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 ${!n.read ? 'bg-muted/30' : ''}`}>
              {n.icon}
              <span className="text-xs text-foreground leading-relaxed">{n.text}</span>
              {!n.read && <span className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Crisis Banner ────────────────────────────────────────────────────────────
function CrisisBanner({ clients, onView, onResolve }: { clients: Client[]; onView: (id: string) => void; onResolve: () => void }) {
  const crisisClient = clients.find(c => daysAgo(c.last_active) >= 5);
  if (!crisisClient) return null;
  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-red-500 text-white text-sm font-medium">
      <AlertTriangle size={18} />
      <span className="flex-1">Crisis Alert: {crisisClient.name} may need immediate support (inactive {daysAgo(crisisClient.last_active)} days)</span>
      <button onClick={() => onView(crisisClient.id)} className="px-3 py-1 rounded-lg border border-white/40 text-white text-xs hover:bg-white/10 transition-colors">View</button>
      <button onClick={onResolve} className="px-3 py-1 rounded-lg bg-white text-red-600 text-xs font-semibold hover:bg-white/90 transition-colors">Mark Resolved</button>
    </div>
  );
}

// ── Add Client Modal ─────────────────────────────────────────────────────────
function AddClientModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (c: Client) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', type: 'homeless', notes: '' });
  const { toast } = useToast();
  const addClient = useAddClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phone.trim()) return;
    try {
      if (!MOCK_MODE) await addClient.mutateAsync(form.phone);
    } catch { /* mock mode */ }
    const newClient: Client = {
      id: Date.now().toString(), name: form.name || 'New Client',
      user_type: form.type, current_step: 1, financial_health_score: 0,
      last_active: new Date().toISOString(), city: '', phone_number: form.phone,
      conversations: [], stepLogs: [],
    };
    onAdd(newClient);
    toast('Client added successfully', 'success');
    onClose();
    setForm({ name: '', phone: '', type: 'homeless', notes: '' });
  }

  const inputCls = 'w-full bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <Modal open={open} onClose={onClose} title="Add New Client">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div><label className="text-xs text-muted-foreground mb-1 block">Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Client name" className={inputCls} /></div>
        <div><label className="text-xs text-muted-foreground mb-1 block">Phone *</label><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555 000 0000" required className={inputCls} /></div>
        <div><label className="text-xs text-muted-foreground mb-1 block">Type</label>
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className={inputCls}>
            <option value="homeless">Homeless</option>
            <option value="reentry">Reentry</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div><label className="text-xs text-muted-foreground mb-1 block">Notes</label><textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." rows={2} className={`${inputCls} resize-none`} /></div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors">Add Client</button>
          <button type="button" onClick={onClose} className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm transition-colors">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

const ELEVENLABS_BASE = `${API_BASE}/audio/elevenlabs`;

/** Milestone steps 2/4/6/8 → files in repo /Elevenlabs (served at /audio/elevenlabs/). */
function milestoneAudioUrl(stepNum: number): string | null {
  const map: Record<number, string> = {
    2: 'step2_id.mp3',
    4: 'step4_bank.mp3',
    6: 'step7_savings.mp3',
    8: 'step8_independence.mp3',
  };
  const file = map[stepNum];
  return file ? `${ELEVENLABS_BASE}/${file}` : null;
}

/** Same catalog as server/services/elevenlabs.js BUNDLED_ELEVENLABS_TRACKS (10 files). */
const ELEVENLABS_SAFETY: { id: string; label: string; file: string }[] = [
  { id: 'shelter_help', label: 'Shelter help', file: 'shelter_help.mp3' },
  { id: 'crisis_support', label: 'Crisis support', file: 'crisis_support.mp3' },
  { id: 'scam_warning', label: 'Scam warning', file: 'scam_warning.mp3' },
  { id: 'how_it_works', label: 'How it works', file: 'how_it_works.mp3' },
];

const ELEVENLABS_JOURNEY_EXTRA: { id: string; label: string; file: string }[] = [
  { id: 'step1_welcome', label: 'Welcome (step 1)', file: 'step1_welcome.mp3' },
  { id: 'step5_job', label: 'Job readiness (step 5)', file: 'step5_job.mp3' },
];

// ── Voice Player (real ElevenLabs MP3s from API server) ─────────────────────
function VoicePlayer({ stepLogs }: { stepLogs: StepLog[] }) {
  const milestones = stepLogs.filter(l => [2, 4, 6, 8].includes(l.step_number));
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeClip, setActiveClip] = useState(milestones[0]?.step_number || 0);
  const [mode, setMode] = useState<'milestone' | 'library'>(() =>
    milestones.length ? 'milestone' : 'library'
  );
  const [libraryFile, setLibraryFile] = useState<string | null>(() =>
    milestones.length ? null : ELEVENLABS_SAFETY[0]?.file ?? null
  );
  const [loadError, setLoadError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const milestoneLabels: Record<number, string> = {
    2: 'First Safe Night', 4: 'Stability Achieved', 6: 'Financial Foundations', 8: 'Full Independence'
  };

  const currentSrc =
    mode === 'library' && libraryFile
      ? `${ELEVENLABS_BASE}/${libraryFile}`
      : milestoneAudioUrl(activeClip);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !currentSrc) return;
    setLoadError(false);
    a.pause();
    a.src = currentSrc;
    a.load();
    setPlaying(false);
    setElapsed(0);
    setDuration(0);
  }, [currentSrc, activeClip, mode, libraryFile]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onMeta = () => {
      setLoadError(false);
      setDuration(a.duration || 0);
    };
    const onErr = () => setLoadError(true);
    const onEnded = () => {
      setPlaying(false);
      setElapsed(0);
      if (tickRef.current) clearInterval(tickRef.current);
    };
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('error', onErr);
    a.addEventListener('ended', onEnded);
    return () => {
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('error', onErr);
      a.removeEventListener('ended', onEnded);
    };
  }, [currentSrc]);

  useEffect(() => () => { if (tickRef.current) clearInterval(tickRef.current); }, []);

  async function togglePlay() {
    const a = audioRef.current;
    if (!a || !currentSrc) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      if (tickRef.current) clearInterval(tickRef.current);
    } else {
      try {
        await a.play();
        setPlaying(true);
        if (tickRef.current) clearInterval(tickRef.current);
        tickRef.current = setInterval(() => {
          setElapsed(Math.floor(a.currentTime || 0));
        }, 250);
      } catch {
        setPlaying(false);
      }
    }
  }

  return (
    <div className="glass-card !p-5 guardian-card space-y-4">
      <div>
        <h3 className="font-heading font-semibold text-sm text-foreground mb-1">Voice guidance</h3>
        <p className="text-xs text-muted-foreground">
          ElevenLabs MP3s are served at{' '}
          <code className="text-[10px] bg-muted px-1 rounded">/audio/elevenlabs</code>
          {API_BASE ? ` on ${API_BASE}` : ' (dev: Vite proxies to the API on port 3001).'} Keep the Redreemer server running.
        </p>
      </div>

      {milestones.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Journey milestones</p>
          <div className="flex gap-2 flex-wrap">
            {milestones.map(l => (
              <button
                key={l.step_number}
                type="button"
                onClick={() => {
                  setMode('milestone');
                  setLibraryFile(null);
                  setActiveClip(l.step_number);
                  setPlaying(false);
                  setElapsed(0);
                }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${mode === 'milestone' && activeClip === l.step_number ? 'bg-indigo-600 text-white border-indigo-600' : 'border-border text-muted-foreground hover:text-foreground'}`}
              >
                Step {l.step_number}: {milestoneLabels[l.step_number] || 'Milestone'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Training &amp; safety</p>
        <div className="flex gap-2 flex-wrap">
          {ELEVENLABS_SAFETY.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                setMode('library');
                setLibraryFile(e.file);
                setPlaying(false);
                setElapsed(0);
              }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${mode === 'library' && libraryFile === e.file ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/50' : 'border-border text-muted-foreground hover:text-foreground'}`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">More journey audio</p>
        <div className="flex gap-2 flex-wrap">
          {ELEVENLABS_JOURNEY_EXTRA.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                setMode('library');
                setLibraryFile(e.file);
                setPlaying(false);
                setElapsed(0);
              }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${mode === 'library' && libraryFile === e.file ? 'bg-violet-500/20 text-violet-800 dark:text-violet-200 border-violet-500/50' : 'border-border text-muted-foreground hover:text-foreground'}`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {!currentSrc ? (
        <p className="text-xs text-muted-foreground">No audio mapped for this selection.</p>
      ) : (
        <>
          <audio ref={audioRef} className="hidden" preload="metadata" />
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlay}
              disabled={!currentSrc}
              className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-40"
            >
              {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <div className="flex-1 min-w-0">
              {loadError ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Could not load this track. Put the matching <code className="text-[10px]">.mp3</code> in{' '}
                  <code className="text-[10px]">Elevenlabs/</code> and ensure the API is running.
                </p>
              ) : (
                <>
                  <div className="flex gap-0.5 h-8 items-center">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all ${playing ? 'bg-indigo-500' : 'bg-muted'}`}
                        style={{
                          height: playing ? `${12 + Math.sin(i * 0.8 + elapsed * 0.5) * 10}px` : '8px',
                          animation: playing ? `waveform ${0.4 + (i % 3) * 0.2}s ease-in-out infinite` : 'none',
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{elapsed}s</span>
                    <span>{duration && !Number.isNaN(duration) ? `${Math.round(duration)}s` : '—'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Journey Timeline ──────────────────────────────────────────────────────────
function JourneyTimeline({ client }: { client: Client }) {
  const events = [
    { date: client.stepLogs[0]?.completed_at || client.last_active, label: 'Joined Redreemer', milestone: false },
    ...client.stepLogs.map(l => ({
      date: l.completed_at,
      label: `Completed Step ${l.step_number}: ${l.notes}`,
      milestone: [2, 4, 6, 8].includes(l.step_number),
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (events.length === 0) return null;

  return (
    <div className="glass-card !p-5 guardian-card">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Journey Timeline</h3>
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {events.map((ev, i) => (
            <div key={i} className="flex items-start gap-4 pl-8 relative">
              <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${ev.milestone ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                {ev.milestone ? <Award size={12} /> : <CheckCircle size={12} />}
              </div>
              <div>
                <p className="text-foreground text-sm">{ev.label}</p>
                <p className="text-muted-foreground text-xs">{new Date(ev.date).toLocaleDateString()}</p>
              </div>
              {ev.milestone && <span className="ml-auto text-[10px] bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 px-2 py-0.5 rounded-full">Milestone</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Caseworker Notes ──────────────────────────────────────────────────────────
function CaseworkerNotes({ clientId }: { clientId: string }) {
  const storageKey = `redreemer-notes-${clientId}`;
  const [notes, setNotes] = useState<{ id: number; text: string; date: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });
  const [draft, setDraft] = useState('');
  const { toast } = useToast();

  function saveNote() {
    if (!draft.trim()) return;
    const updated = [...notes, { id: Date.now(), text: draft.trim(), date: new Date().toLocaleString() }];
    setNotes(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setDraft('');
    toast('Note saved', 'success');
  }

  function deleteNote(id: number) {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }

  return (
    <div className="glass-card !p-5 guardian-card">
      <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Caseworker Notes</h3>
      <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Add a private note about this client..."
        rows={3} className="w-full bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none mb-2" />
      <button onClick={saveNote} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">Save Note</button>
      {notes.length > 0 && (
        <div className="mt-4 space-y-2">
          {notes.map(n => (
            <div key={n.id} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-foreground text-sm">{n.text}</p>
                <p className="text-muted-foreground text-xs mt-1">{n.date}</p>
              </div>
              <button onClick={() => deleteNote(n.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Client Detail ─────────────────────────────────────────────────────────────
function ClientDetailView({ client, useMock, onStepChange }: { client: Client; useMock: boolean; onStepChange: (step: number) => void }) {
  const [message, setMessage] = useState('');
  const [stepVal, setStepVal] = useState(client.current_step);
  const [confirmStep, setConfirmStep] = useState<number | null>(null);
  const sendMessage = useSendMessage();
  const updateStep = useUpdateStep();
  const { toast } = useToast();

  const typeInfo: Record<string, { label: string; cls: string }> = {
    homeless: { label: 'Homeless', cls: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
    reentry:  { label: 'Reentry',  cls: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    both:     { label: 'Both',     cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  };
  const info = typeInfo[client.user_type] ?? typeInfo.homeless;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) { toast('Please type a message', 'error'); return; }
    if (!useMock) {
      try { await sendMessage.mutateAsync({ clientId: client.id, message }); } catch { /* ignore */ }
    }
    toast('Message sent', 'success');
    setMessage('');
  }

  function handleExport() {
    const content = generateReport(client);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${client.name}-report.txt`; a.click();
    URL.revokeObjectURL(url);
    toast('Report downloaded', 'success');
  }

  async function confirmStepChange(step: number) {
    setStepVal(step);
    setConfirmStep(null);
    if (!useMock) {
      try { await updateStep.mutateAsync({ clientId: client.id, step }); } catch { /* ignore */ }
    }
    onStepChange(step);
    toast(`${client.name} advanced to Step ${step}`, 'success');
  }

  const scoreCircumference = 2 * Math.PI * 28;
  const scoreOffset = scoreCircumference - (client.financial_health_score / 100) * scoreCircumference;

  return (
    <div className="space-y-5 max-w-4xl view-enter">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl text-foreground">{client.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${info.cls}`}>{info.label}</span>
            <span className="text-muted-foreground text-xs flex items-center gap-1"><Clock size={11} /> {new Date(client.last_active).toLocaleDateString()}</span>
            {client.city && <span className="text-muted-foreground text-xs">{client.city}</span>}
          </div>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs text-foreground hover:bg-foreground/10 transition-colors">
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* Health Score */}
      <div className="glass-card !p-5 guardian-card">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Financial Health Score</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
              <circle cx="32" cy="32" r="28" fill="none"
                stroke={client.financial_health_score >= 70 ? '#10B981' : client.financial_health_score >= 40 ? '#6366F1' : '#EF4444'}
                strokeWidth="5"
                strokeDasharray={scoreCircumference}
                strokeDashoffset={scoreOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-indigo-400 font-bold text-sm">{client.financial_health_score}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {client.financial_health_score < 30 ? 'Critical — needs immediate support' : client.financial_health_score < 60 ? 'Building — steady progress' : 'Strong — on track to independence'}
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="glass-card !p-5 guardian-card">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Step Progress</h3>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center flex-1">
              <button
                onClick={() => i + 1 > stepVal ? setConfirmStep(i + 1) : setStepVal(i + 1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110 ${i < stepVal ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground hover:bg-indigo-600/30'}`}
                title={`Step ${i + 1}`}
              >
                {i + 1}
              </button>
              {i < 7 && <div className={`flex-1 h-0.5 ${i < stepVal - 1 ? 'bg-indigo-600' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>
        {client.stepLogs.length > 0 && (
          <div className="space-y-1.5">
            {client.stepLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <ChevronRight size={12} className="text-indigo-400" />
                <span className="text-foreground">Step {log.step_number}</span>
                <span className="text-muted-foreground">— {log.notes}</span>
                <span className="text-muted-foreground ml-auto">{new Date(log.completed_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <VoicePlayer stepLogs={client.stepLogs} />

      {/* Conversations */}
      <div className="glass-card !p-5 guardian-card">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Recent Conversations</h3>
        {client.conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={32} className="text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-muted-foreground text-sm">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[360px] overflow-y-auto">
            {client.conversations.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-md' : 'glass text-foreground rounded-tl-md'}`}>
                  {msg.content}
                  <div
                    className={`mt-1 flex items-center gap-2 text-[10px] ${
                      msg.role === 'user' ? 'justify-end' : 'justify-between text-muted-foreground'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <>
                        <span className="text-white/60">{new Date(msg.created_at).toLocaleString()}</span>
                        <ReplySpeechButton text={msg.content} variant="dashboardUser" listenLabel="Listen" />
                      </>
                    ) : (
                      <>
                        <ReplySpeechButton text={msg.content} variant="dashboard" listenLabel="Listen" />
                        <span>{new Date(msg.created_at).toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Composer */}
      <div className="glass-card !p-5 guardian-card">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Send Message</h3>
        <form onSubmit={handleSend} className="flex flex-wrap items-center gap-2">
          <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message to send via SMS..."
            className="flex-1 min-w-[160px] px-4 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          <ReplySpeechButton text={message} variant="dashboard" listenLabel="Hear draft" className="py-2.5 px-2" />
          <button type="submit" disabled={sendMessage.isPending}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60 transition-colors">
            <Phone size={16} /> {sendMessage.isPending ? '...' : 'Send'}
          </button>
        </form>
      </div>

      <JourneyTimeline client={client} />
      <CaseworkerNotes clientId={client.id} />

      {/* Confirm step modal */}
      <Modal open={confirmStep !== null} onClose={() => setConfirmStep(null)} title="Advance Step">
        <p>Advance <strong className="text-foreground">{client.name}</strong> to Step {confirmStep}?</p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => confirmStep && confirmStepChange(confirmStep)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors">Confirm</button>
          <button onClick={() => setConfirmStep(null)} className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm transition-colors">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

// ── Analytics View ────────────────────────────────────────────────────────────
function AnalyticsView({ clients, useMock, onNavigateClients }: { clients: Client[]; useMock: boolean; onNavigateClients: (id?: string) => void }) {
  const { data: apiAnalytics, isError } = useAnalytics();
  const runDemo = useRunDemo();
  const { toast } = useToast();
  const [demoLoading, setDemoLoading] = useState(false);

  const analytics = (useMock || isError || !apiAnalytics) ? MOCK_ANALYTICS : apiAnalytics;
  const stats = [
    { label: 'Total Clients', value: String(analytics.totalClients ?? 0), icon: Users, action: () => onNavigateClients() },
    { label: 'Messages Sent', value: Number(analytics.totalMessages ?? 0).toLocaleString(), icon: MessageSquare, action: undefined },
    { label: 'Steps Completed', value: String(analytics.totalStepsCompleted ?? 0), icon: ChevronRight, action: undefined },
    { label: 'Avg Health Score', value: String(analytics.avgHealthScore ?? 0), icon: BarChart2, action: undefined },
  ];

  const funnel = analytics.stepsFunnel ?? MOCK_ANALYTICS.stepsFunnel;
  const maxCount = Math.max(...funnel.map((s: { count: number }) => s.count), 1);
  const breakdown = analytics.typeBreakdown ?? MOCK_ANALYTICS.typeBreakdown;

  async function handleRunDemo() {
    setDemoLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    try {
      if (!useMock) await runDemo.mutateAsync();
    } catch { /* mock mode */ }
    toast('Alex added — check Clients tab', 'success');
    setDemoLoading(false);
    setTimeout(() => onNavigateClients(), 1000);
  }

  return (
    <div className="max-w-4xl space-y-6 view-enter">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-foreground">Analytics Overview</h2>
        <button onClick={handleRunDemo} disabled={demoLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-600/30 text-sm font-medium hover:bg-indigo-600/20 transition-colors disabled:opacity-60">
          {demoLoading ? <><RotateCcw size={14} className="animate-spin" /> Running...</> : <><Play size={14} /> Run Full Demo Sequence</>}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <button key={s.label} onClick={s.action} className={`glass-card !p-5 text-center guardian-card ${s.action ? 'cursor-pointer hover:border-indigo-500/30' : 'cursor-default'}`}>
            <s.icon size={20} className="text-indigo-400 mx-auto mb-2" />
            <div className="font-mono text-2xl text-indigo-400 font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="glass-card !p-5 guardian-card">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Steps Funnel</h3>
        <div className="space-y-2">
          {funnel.map((s: { step: number; count: number }) => (
            <div key={s.step} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-12">Step {s.step}</span>
              <div className="flex-1 h-4 bg-muted rounded">
                <div className="h-full bg-indigo-600 rounded transition-all" style={{ width: `${(s.count / maxCount) * 100}%` }} />
              </div>
              <span className="text-xs font-mono text-foreground w-6 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card !p-5 guardian-card">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-3">User Types</h3>
          <div className="space-y-2">
            {[
              { type: 'Homeless', count: breakdown.homeless ?? 0, color: 'bg-violet-500' },
              { type: 'Reentry',  count: breakdown.reentry  ?? 0, color: 'bg-indigo-500' },
              { type: 'Both',     count: breakdown.both     ?? 0, color: 'bg-purple-500' },
            ].map((t) => (
              <div key={t.type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${t.color}`} />
                <span className="text-sm text-foreground flex-1">{t.type}</span>
                <span className="font-mono text-sm text-muted-foreground">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card !p-5 guardian-card">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Activity</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-foreground">Active this week</span><span className="text-accent font-mono">{analytics.activeThisWeek ?? 0}</span></div>
            <div className="flex justify-between text-sm"><span className="text-foreground">Inactive 5+ days</span><span className="text-destructive font-mono">{analytics.inactiveUsers ?? 0}</span></div>
          </div>
        </div>
      </div>

      {/* Client Progress Comparison */}
      <div className="glass-card !p-5 guardian-card">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Client Health Scores</h3>
        <div className="space-y-3">
          {clients.map(c => {
            const color = c.financial_health_score >= 70 ? 'bg-emerald-500' : c.financial_health_score >= 40 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <button key={c.id} onClick={() => onNavigateClients(c.id)} className="w-full flex items-center gap-3 hover:bg-muted/30 rounded-lg p-1 transition-colors">
                <span className="text-sm text-foreground w-16 text-left">{c.name}</span>
                <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                  <div className={`h-full ${color} rounded transition-all duration-700`} style={{ width: `${c.financial_health_score}%` }} />
                </div>
                <span className="font-mono text-xs text-muted-foreground w-8 text-right">{c.financial_health_score}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<'clients' | 'analytics' | 'wellness'>('clients');
  const [selectedClientId, setSelectedClientId] = useState<string>('1');
  const [search, setSearch] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [crisisResolved, setCrisisResolved] = useState(false);
  const [localClients, setLocalClients] = useState<Client[]>(MOCK_CLIENTS);

  const { data: apiClients, isError: clientsError } = useClients();
  const useMock = MOCK_MODE || clientsError || !apiClients;
  const clients: Client[] = useMock ? localClients : (apiClients as Client[]);

  const filtered = clients.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
  const selectedClient = clients.find(c => c.id === selectedClientId) ?? clients[0];

  function handleNavigateClients(id?: string) {
    setView('clients');
    if (id) setSelectedClientId(id);
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-search]')?.focus();
      }
      if (e.key === '1') setView('clients');
      if (e.key === '2') setView('analytics');
      if (e.key === '3') setView('wellness');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — Guardian theme (indigo) */}
      <aside className="w-[260px] border-r border-border flex flex-col shrink-0" style={{ background: 'hsl(var(--sidebar-background))' }}>
        <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-transparent" />
        <div className="flex items-center gap-2 px-5 py-5">
          <Logo size="sm" />
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {userType === 'caseworker' && (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50 mb-1"
            >
              <Home size={16} />
              Overview
            </button>
          )}
          {([
            { id: 'clients' as const, icon: Users, label: 'Clients' },
            { id: 'analytics' as const, icon: BarChart2, label: 'Analytics' },
            { id: 'wellness' as const, icon: Wallet, label: 'Financial Wellness' },
          ] as const).map((item) => (
            <button key={item.id} onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                view === item.id
                  ? 'bg-indigo-600/15 text-indigo-400 border-l-[3px] border-indigo-500'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}>
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-xs font-bold">CW</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-foreground font-medium truncate">caseworker@org.com</div>
            </div>
            <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Crisis banner */}
        {!crisisResolved && (
          <CrisisBanner clients={clients} onView={id => { setSelectedClientId(id); setView('clients'); }} onResolve={() => setCrisisResolved(true)} />
        )}

        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center px-6 shrink-0 gap-3">
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">
            {view === 'clients' ? 'Clients' : view === 'analytics' ? 'Analytics' : 'Financial Wellness'}
          </h1>
          {useMock && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">Mock Mode</span>}
          <NotificationBell />
          <button onClick={toggleTheme} className="w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        {view === 'clients' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Client list */}
            <div className="w-[280px] border-r border-border flex flex-col shrink-0 overflow-hidden">
              <div className="p-3 space-y-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input data-search value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients... (⌘K)"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <button onClick={() => setShowAddClient(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                  <UserPlus size={16} /> Add Client
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                {filtered.length === 0 && (
                  <div className="text-center py-12">
                    <Users size={32} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="text-muted-foreground text-sm">No clients match your search</p>
                  </div>
                )}
                {filtered.map((c) => {
                  const inactive = daysAgo(c.last_active) >= 5;
                  return (
                    <button key={c.id} onClick={() => setSelectedClientId(c.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${selectedClient?.id === c.id ? 'bg-muted border-l-[3px] border-indigo-500' : 'hover:bg-muted/50 border-l-[3px] border-transparent'}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full ${typeColors[c.user_type] || 'bg-indigo-500'} flex items-center justify-center font-heading font-bold text-white text-sm`}>
                          {c.name?.[0] ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">{c.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{typeLabels[c.user_type] ?? c.user_type}</span>
                          </div>
                          <div className="h-1.5 rounded bg-muted mt-1.5">
                            <div className="h-full bg-indigo-600 rounded transition-all" style={{ width: `${(c.current_step / 8) * 100}%` }} />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-muted-foreground">Step {c.current_step}/8</span>
                            {inactive && <span className="flex items-center gap-1 text-[10px] text-destructive"><AlertTriangle size={10} /> {daysAgo(c.last_active)}d</span>}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Client detail + phone simulator */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6">
                {selectedClient ? (
                  <ClientDetailView key={selectedClient.id} client={selectedClient} useMock={useMock}
                    onStepChange={step => setLocalClients(p => p.map(c => c.id === selectedClient.id ? { ...c, current_step: step } : c))} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">Select a client</div>
                )}
              </div>
              {selectedClient && (
                <div className="w-[300px] border-l border-border p-4 flex flex-col overflow-hidden shrink-0">
                  <h3 className="font-heading font-semibold text-sm text-foreground mb-1">SMS Simulator</h3>
                  <div className="flex-1 min-h-0">
                    <PhoneSimulator
                      clientId={selectedClient.id}
                      clientPhone={selectedClient.phone_number}
                      clientName={selectedClient.name}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : view === 'analytics' ? (
          <div className="flex-1 overflow-y-auto p-6">
            <AnalyticsView clients={clients} useMock={useMock} onNavigateClients={handleNavigateClients} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl space-y-6 view-enter">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold text-xl text-foreground">Financial Wellness Tools</h2>
                <a href="/wellness" className="text-sm text-emerald-400 hover:underline">Open full suite</a>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { Icon: Wallet, title: 'Budget Tracker', desc: 'Manage your first paycheck wisely', color: 'bg-emerald-500/20 text-emerald-400' },
                  { Icon: Shield, title: 'Emergency Fund', desc: 'Build your safety net', color: 'bg-teal-500/20 text-teal-400' },
                  { Icon: TrendingUp, title: 'Debt Payoff', desc: 'Avalanche or snowball method', color: 'bg-blue-500/20 text-blue-400' },
                  { Icon: Target, title: 'Savings Goals', desc: 'Track your milestones', color: 'bg-green-500/20 text-green-400' },
                  { Icon: BookOpen, title: 'Financial Literacy', desc: '6 modules, plain English', color: 'bg-purple-500/20 text-purple-400' },
                  { Icon: Activity, title: 'Risk Score', desc: 'Assess your financial stability', color: 'bg-orange-500/20 text-orange-400' },
                  { Icon: ShieldCheck, title: 'Insurance Education', desc: 'Health, renters, and more', color: 'bg-amber-500/20 text-amber-400' },
                ].map((t) => (
                  <a key={t.title} href="/wellness" className="glass-card !p-5 text-center flourish-card hover:border-emerald-500/30 transition-all">
                    <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center mx-auto mb-3`}>
                      <t.Icon size={22} />
                    </div>
                    <h3 className="font-heading font-bold text-foreground mb-1 text-sm">{t.title}</h3>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <AddClientModal open={showAddClient} onClose={() => setShowAddClient(false)}
        onAdd={c => setLocalClients(p => [c, ...p])} />
    </div>
  );
}
