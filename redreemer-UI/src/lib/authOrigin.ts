/**
 * Auth0 SPA + PKCE: redirect_uri MUST use the same origin as the tab where login started.
 * The code_verifier lives in sessionStorage for that origin. A baked-in production URL
 * (e.g. via env) breaks sign-in from www vs apex, preview deploys, or any other host mismatch.
 *
 * Add every origin you use to Auth0 → Application → Allowed Callback URLs, e.g.:
 * https://redreemer.vercel.app/callback, preview URLs, and http://localhost:5173/callback for dev.
 */
export function getAuthRedirectUri(): string {
  return `${window.location.origin}/callback`;
}

export function getAppOriginForLogout(): string {
  return window.location.origin;
}
