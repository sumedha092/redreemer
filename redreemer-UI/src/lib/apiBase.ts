/**
 * Base URL for API + static audio in the browser.
 * - Dev + default API host: empty string → same origin; Vite proxies /api, /sms, /audio, /clips
 *   (proxy target: API_PROXY_TARGET in .env, default http://localhost:3001 — see vite.config.ts).
 * - Otherwise: VITE_API_URL (required when UI and API are on different hosts in production).
 */
const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

const useLocalDevProxy =
  import.meta.env.DEV &&
  (!envUrl ||
    envUrl === 'http://localhost:3001' ||
    envUrl === 'http://127.0.0.1:3001');

export const API_BASE = useLocalDevProxy ? '' : envUrl;
