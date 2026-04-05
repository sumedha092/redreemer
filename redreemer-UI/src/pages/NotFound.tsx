import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center text-foreground">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Logo size="md" />
      <h1 className="font-heading font-extrabold text-7xl text-foreground mt-10 mb-2">404</h1>
      <p className="text-muted-foreground text-lg mb-8">{t('notfound.message')}</p>
      <button onClick={() => navigate('/')}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-900 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
        <Home size={16} /> {t('notfound.home')}
      </button>
    </div>
  );
}
