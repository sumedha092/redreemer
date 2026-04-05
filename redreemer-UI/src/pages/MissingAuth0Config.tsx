/** Shown in production when Auth0 env vars are missing and mock mode is off. */
export default function MissingAuth0Config() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8 text-foreground">
      <div className="max-w-lg space-y-4 text-center">
        <h1 className="text-xl font-semibold">Auth0 is not configured</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Add <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_AUTH0_DOMAIN</code> and{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_AUTH0_CLIENT_ID</code> to{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">redreemer-UI/.env</code>.
          Use your Auth0 tenant hostname only (example: <code className="text-xs">dev-abc.us.auth0.com</code>) — do not include{' '}
          <code className="text-xs">https://</code>.
        </p>
        <p className="text-muted-foreground text-sm">
          For a local demo without Auth0, set <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_MOCK_MODE=true</code> and rebuild.
        </p>
      </div>
    </div>
  );
}
