import { useState, useEffect } from 'react';
import { ArrowRight, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import Logo from '@/components/Logo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-xl border-b border-border bg-background/80' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors">How it works</button>
            <button onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors">Mission</button>
            <button onClick={() => document.getElementById('for-caseworkers')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-foreground transition-colors">For caseworkers</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:glow-amber transition-all"
          >
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}
