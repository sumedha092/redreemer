import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, UserType } from '@/context/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';
import Logo from '@/components/Logo';
import LanguageMenu from '@/components/LanguageMenu';
import { Users, Home, RotateCcw, ArrowRight, CheckCircle, Zap, Shield, Heart } from 'lucide-react';

const USER_TYPES: { type: UserType; icon: typeof Users; titleKey: string; descKey: string }[] = [
  {
    type: 'caseworker',
    icon: Users,
    titleKey: 'signup.typeCaseworkerTitle',
    descKey: 'signup.typeCaseworkerDesc',
  },
  {
    type: 'homeless',
    icon: Home,
    titleKey: 'signup.typeHomelessTitle',
    descKey: 'signup.typeHomelessDesc',
  },
  {
    type: 'reentry',
    icon: RotateCcw,
    titleKey: 'signup.typeReentryTitle',
    descKey: 'signup.typeReentryDesc',
  },
];

export default function Signup() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<UserType>(null);
  const { setUserType } = useAuth();
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  function handleNext() {
    if (!selected) return;
    setUserType(selected);
    loginWithRedirect({ appState: { returnTo: '/dashboard' }, authorizationParams: { screen_hint: 'signup' } });
  }

  return (
    <div className="relative min-h-screen flex bg-background text-foreground">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #ffe44d 0%, #f5e000 40%, #fce94f 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full opacity-20" style={{ background: '#e8c800' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full opacity-20" style={{ background: '#e8c800' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10" style={{ background: '#111827' }} />

        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-20" />

        <div className="relative z-10">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width={32} height={32} viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="rgba(0,0,0,0.15)" />
              <text x="14" y="22" textAnchor="middle" fill="#111827" fontSize="18" fontWeight="800" fontFamily="Space Grotesk, sans-serif">R</text>
              <path d="M22 8 L26 4 M26 4 L26 8 M26 4 L22 4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '20px', color: '#111827' }}>
              Redreemer
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="font-heading font-extrabold text-4xl text-gray-900 leading-tight mb-6">
            {t('signup.title')}<br />
            {t('signup.title2')}
          </h1>
          <div className="space-y-3">
            {[
              { icon: Zap, textKey: 'signup.bullet1' },
              { icon: Shield, textKey: 'signup.bullet2' },
              { icon: Heart, textKey: 'signup.bullet3' },
              { icon: CheckCircle, textKey: 'signup.bullet4' },
            ].map(f => (
              <div key={f.textKey} className="flex items-center gap-3 text-gray-800 text-sm">
                <f.icon size={16} className="text-gray-700 shrink-0" />
                {t(f.textKey)}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-gray-700 text-xs">
          {t('signup.footer')}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background relative">
        <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
          <LanguageMenu showCurrentLabel={false} align="right" />
        </div>
        <div className="w-full max-w-[460px]">
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>

          <h2 className="font-heading font-bold text-2xl text-foreground mb-1">{t('signup.heading')}</h2>
          <p className="text-muted-foreground text-sm mb-2">{t('signup.sub1')}</p>
          <p className="text-muted-foreground/80 text-xs mb-8">{t('signup.sub2')}</p>

          <div className="space-y-3 mb-8">
            {USER_TYPES.map(({ type, icon: Icon, titleKey, descKey }) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelected(type)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  selected === type
                    ? 'border-yellow-400/70 bg-yellow-500/10'
                    : 'border-border hover:border-muted-foreground/30 bg-card'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  selected === type ? 'bg-yellow-500/15' : 'bg-muted'
                }`}>
                  <Icon size={20} className={selected === type ? 'text-foreground' : 'text-muted-foreground'} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{t(titleKey)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t(descKey)}</p>
                </div>
                {selected === type && <CheckCircle size={18} className="text-foreground shrink-0" />}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={!selected}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: selected ? 'linear-gradient(135deg, #ffe44d, #f5e000)' : 'hsl(var(--muted))' }}
          >
            {t('signup.continue')} <ArrowRight size={18} />
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
            {t('signup.confidential')}
          </p>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t('signup.haveAccount')}{' '}
            <button type="button" onClick={() => navigate('/login')} className="text-foreground hover:underline font-medium">
              {t('nav.signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
