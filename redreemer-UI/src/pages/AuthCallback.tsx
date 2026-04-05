import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ThemeToggle } from '@/components/ThemeToggle';

/**
 * OAuth redirect lands here first. Auth0Provider exchanges the code for tokens,
 * then onRedirectCallback navigates to the app. This route must not redirect
 * unauthenticated users away before that finishes (unlike /dashboard).
 */
export default function AuthCallback() {
  const { isLoading, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (error) {
      console.error('[Auth0]', error);
      navigate('/login', { replace: true, state: { authError: error.message } });
    }
  }, [isLoading, error, navigate]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center gap-3 bg-background p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-10 h-10 rounded-xl overflow-hidden">
        <img src="/reverse-logo.png" alt="Redreemer" className="w-full h-full" />
      </div>
      <p className="text-muted-foreground text-sm animate-pulse">
        {error ? 'Could not complete sign-in. Redirecting…' : 'Signing you in…'}
      </p>
      {error ? (
        <p className="text-destructive text-xs text-center max-w-sm px-4">{error.message}</p>
      ) : null}
    </div>
  );
}
