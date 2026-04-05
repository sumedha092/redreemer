/**
 * Base URL for API + static audio in the browser.
 * Dev: empty string → Vite proxies /api, /sms, /audio, /clips to localhost:3001
 * Prod: VITE_API_URL
 */
const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

const useLocalDevProxy =
  import.meta.env.DEV &&
  (!envUrl || envUrl === 'http://localhost:3001' || envUrl === 'http://127.0.0.1:3001');

export const API_BASE = useLocalDevProxy ? '' : envUrl;
