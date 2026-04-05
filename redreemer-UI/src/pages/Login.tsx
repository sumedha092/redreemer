import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import LanguageMenu from '@/components/LanguageMenu';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const { setUserType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const authError = (location.state as { authError?: string } | null)?.authError;

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <LanguageMenu showCurrentLabel={false} align="right" />
      </div>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <Logo size="lg" />
          <h1 className="font-heading font-bold text-2xl text-foreground mt-6 mb-2">{t('login.welcomeBack')}</h1>
          <p className="text-muted-foreground text-sm">{t('login.subtitle')}</p>
        </div>

        {authError ? (
          <p className="text-sm text-destructive text-center mb-4 px-2" role="alert">
            {authError}
          </p>
        ) : null}

        <div className="glass-card space-y-4">
          <button
            onClick={() => {
              setUserType('caseworker');
              loginWithRedirect({ appState: { returnTo: '/dashboard' } });
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:glow-amber transition-all"
          >
            {t('login.signInCta')} <ArrowRight size={18} />
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('login.noAccount')}{' '}
          <button type="button" onClick={() => navigate('/signup')} className="text-foreground/80 hover:underline font-medium">
            {t('login.signUp')}
          </button>
        </p>
      </div>
    </div>
  );
}
