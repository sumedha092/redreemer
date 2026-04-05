import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import { ArrowRight } from 'lucide-react';

export default function Login() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const { userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <Logo size="lg" />
          <h1 className="font-heading font-bold text-2xl text-foreground mt-6 mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your Redreemer account</p>
        </div>

        <div className="glass-card space-y-4">
          <button
            onClick={() => loginWithRedirect({ appState: { returnTo: '/dashboard' } })}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:glow-amber transition-all"
          >
            Sign in <ArrowRight size={18} />
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <button onClick={() => navigate('/signup')} className="text-gray-700 hover:underline font-medium">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
