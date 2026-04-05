/**
 * VITE_* values are pasted into dashboards with trailing spaces/newlines easily.
 * A space in the domain breaks issuer validation: expected "https://tenant.auth0.com /".
 */
function trimEnv(key: keyof ImportMetaEnv): string {
  const v = import.meta.env[key];
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * Auth0 React expects the tenant host only, e.g. dev-abc.us.auth0.com
 * (not https://... — we strip that if someone pasted a full issuer URL).
 */
export function getAuth0Domain(): string {
  let raw = trimEnv('VITE_AUTH0_DOMAIN');
  if (!raw) return '';
  raw = raw.replace(/\/+$/, '');
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      return new URL(raw).hostname;
    } catch {
      return raw;
    }
  }
  return raw;
}

export function getAuth0ClientId(): string {
  return trimEnv('VITE_AUTH0_CLIENT_ID');
}

export function getAuth0Audience(): string | undefined {
  const a = trimEnv('VITE_AUTH0_AUDIENCE');
  return a || undefined;
}
