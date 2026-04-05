import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { API_BASE } from '@/lib/apiBase';
import { useToast } from '@/components/Toast';

const MAX_CHARS = 2500;
const STOP_EVENT = 'redreemer-stop-reply-tts';

type Variant = 'dashboard' | 'dashboardUser' | 'phoneDark' | 'phoneUser';

interface Props {
  text: string;
  variant?: Variant;
  className?: string;
  /** Button label when idle (e.g. "Hear draft" for composer) */
  listenLabel?: string;
}

/**
 * POST /api/tts — speaks the given text. Only one playback at a time app-wide.
 */
export default function ReplySpeechButton({
  text,
  variant = 'dashboard',
  className = '',
  listenLabel = 'Listen',
}: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const stopLocal = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.src = '';
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    const onStopAll = () => stopLocal();
    window.addEventListener(STOP_EVENT, onStopAll);
    return () => {
      window.removeEventListener(STOP_EVENT, onStopAll);
      stopLocal();
    };
  }, [stopLocal]);

  async function listen() {
    const trimmed = text.trim().slice(0, MAX_CHARS);
    if (!trimmed || loading) return;

    window.dispatchEvent(new Event(STOP_EVENT));
    stopLocal();

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok) {
        const err = ct.includes('application/json') ? await res.json().catch(() => ({})) : {};
        throw new Error(typeof err.error === 'string' ? err.error : `Speech failed (${res.status})`);
      }
      if (!ct.includes('audio')) throw new Error('Server did not return audio');

      const buf = await res.arrayBuffer();
      const blob = new Blob([buf], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const a = audioRef.current;
      if (!a) return;
      a.src = url;
      a.onended = () => setPlaying(false);
      a.onerror = () => {
        setPlaying(false);
        toast('Could not play audio', 'error');
      };
      await a.play();
      setPlaying(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Speech failed';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  const styles: Record<Variant, string> = {
    dashboard: 'text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10',
    dashboardUser: 'text-white/75 hover:text-white hover:bg-white/15',
    phoneDark: 'text-[#8e8e93] hover:text-white hover:bg-white/10',
    phoneUser: 'text-blue-200/90 hover:text-white hover:bg-white/15',
  };

  return (
    <>
      <button
        type="button"
        onClick={listen}
        disabled={loading || !text.trim()}
        title={listenLabel}
        aria-label={listenLabel}
        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors disabled:opacity-40 ${styles[variant]} ${className}`}
      >
        {loading ? <Loader2 size={12} className="animate-spin shrink-0" /> : <Volume2 size={12} className="shrink-0" />}
        <span>{loading ? '…' : playing ? 'Playing' : listenLabel}</span>
      </button>
      <audio ref={audioRef} className="hidden" preload="none" />
    </>
  );
}
