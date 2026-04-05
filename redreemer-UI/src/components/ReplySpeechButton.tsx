import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { API_BASE } from '@/lib/apiBase';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';

const MAX_CHARS = 2500;
const STOP_EVENT = 'redreemer-stop-reply-tts';

type Variant = 'dashboard' | 'dashboardUser' | 'phoneDark' | 'phoneUser';

interface Props {
  text: string;
  variant?: Variant;
  className?: string;
  listenLabel?: string;
}

/**
 * POST /api/tts — speaks the given text via ElevenLabs.
 * Only one playback at a time app-wide (dispatches stop event to others).
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
    if (a) { a.pause(); a.src = ''; }
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

    // Stop any other playing instance
    window.dispatchEvent(new Event(STOP_EVENT));
    stopLocal();

    if (!API_BASE && import.meta.env.PROD) {
      toast('Speech needs VITE_API_URL pointing to your API server', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<ArrayBuffer>(
        '/api/tts',
        { text: trimmed },
        {
          responseType: 'arraybuffer',
          headers: { Accept: 'audio/mpeg' },
          validateStatus: () => true,
        }
      );
      const buf = res.data;
      const ct = String(res.headers['content-type'] || '');
      if (res.status !== 200) {
        let msg = `Speech failed (${res.status})`;
        if (ct.includes('application/json') && buf.byteLength < 4096) {
          try {
            const j = JSON.parse(new TextDecoder().decode(buf)) as { error?: string };
            if (typeof j.error === 'string') msg = j.error;
          } catch {
            /* ignore */
          }
        }
        throw new Error(msg);
      }
      if (ct.includes('text/html')) {
        throw new Error(
          'API returned HTML, not audio. Use VITE_API_URL=/api/p on Vercel and set API_UPSTREAM_ORIGIN to your Node server.'
        );
      }
      if (buf.byteLength < 64) {
        throw new Error('Server returned empty audio (check ELEVENLABS_API_KEY on the API server)');
      }
      const blob = new Blob([buf], { type: 'audio/mpeg' });
      const objectUrl = URL.createObjectURL(blob);
      blobUrlRef.current = objectUrl;

      const a = audioRef.current;
      if (!a) return;
      a.src = objectUrl;
      a.onended = () => setPlaying(false);
      a.onerror = () => { setPlaying(false); toast('Could not play audio', 'error'); };
      await a.play();
      setPlaying(true);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Speech failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  const styles: Record<Variant, string> = {
    dashboard:     'text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10',
    dashboardUser: 'text-white/75 hover:text-white hover:bg-white/15',
    phoneDark:     'text-[#8e8e93] hover:text-white hover:bg-white/10',
    phoneUser:     'text-blue-200/90 hover:text-white hover:bg-white/15',
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
        {loading
          ? <Loader2 size={12} className="animate-spin shrink-0" />
          : <Volume2 size={12} className="shrink-0" />}
        <span>{loading ? '…' : playing ? 'Playing' : listenLabel}</span>
      </button>
      <audio ref={audioRef} className="hidden" preload="none" />
    </>
  );
}
