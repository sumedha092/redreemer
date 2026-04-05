import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/Logo';
import LanguageMenu from '@/components/LanguageMenu';

export default function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-xl border-b border-border bg-white/90' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors">{t('nav.howItWorks')}</button>
            <button onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors">{t('nav.mission')}</button>
            <button onClick={() => document.getElementById('for-caseworkers')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors">{t('nav.forCaseworkers')}</button>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageMenu showCurrentLabel={false} className="text-muted-foreground" align="right" />
          <button type="button" onClick={() => navigate('/login')} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            {t('nav.signIn')}
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:glow-amber transition-all"
          >
            {t('nav.getStarted')} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}
