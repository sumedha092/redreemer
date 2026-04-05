/**
 * Base URL for API + static audio in the browser.
 * Dev: empty string → Vite proxies /api, /sms, /audio, /clips to localhost:3001
 * Prod: VITE_API_URL (must be https URL of your Node server — never localhost)
 */
function trimApiUrl(raw: string | undefined): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim().replace(/\/+$/, '');
}

const envUrl = trimApiUrl(import.meta.env.VITE_API_URL as string | undefined);

const useLocalDevProxy =
  import.meta.env.DEV &&
  (!envUrl || envUrl === 'http://localhost:3001' || envUrl === 'http://127.0.0.1:3001');

/** Use this for fetch() and axios — single source of truth */
export const API_BASE = useLocalDevProxy ? '' : envUrl;

/**
 * ngrok free tier serves an HTML interstitial to browsers unless this header is sent.
 * That page has no CORS headers → browser reports "No Access-Control-Allow-Origin".
 */
export function getNgrokSkipHeaders(): Record<string, string> {
  const base = (API_BASE || '').toLowerCase();
  if (
    base.includes('ngrok-free') ||
    base.includes('ngrok.io') ||
    base.includes('ngrok.app')
  ) {
    return { 'ngrok-skip-browser-warning': 'true' };
  }
  return {};
}
