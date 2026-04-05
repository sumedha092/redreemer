import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserType } from '@/context/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';
import Logo from '@/components/Logo';
import { Users, Home, RotateCcw, ArrowRight, CheckCircle, Zap, Shield, Heart } from 'lucide-react';

const USER_TYPES: { type: UserType; icon: typeof Users; title: string; desc: string }[] = [
  {
    type: 'caseworker',
    icon: Users,
    title: 'Caseworker / Organization',
    desc: 'I support clients experiencing homelessness or reentry',
  },
  {
    type: 'homeless',
    icon: Home,
    title: "I'm experiencing homelessness",
    desc: 'I need help with shelter, food, ID, banking, and benefits',
  },
  {
    type: 'reentry',
    icon: RotateCcw,
    title: "I'm recently released",
    desc: 'I was recently released from incarceration and need support',
  },
];

export default function Signup() {
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
    <div className="min-h-screen flex bg-white">
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
          <Logo size="md" />
        </div>

        <div className="relative z-10">
          <h1 className="font-heading font-extrabold text-4xl text-gray-900 leading-tight mb-6">
            Redeem your next step.<br />
            Redream what's possible.
          </h1>
          <div className="space-y-3">
            {[
              { icon: Zap, text: 'Free for everyone, always' },
              { icon: Shield, text: 'Works on any phone — no app needed' },
              { icon: Heart, text: 'AI-powered guidance 24/7' },
              { icon: CheckCircle, text: 'Real resources, real addresses' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3 text-gray-800 text-sm">
                <f.icon size={16} className="text-gray-700 shrink-0" />
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-gray-700 text-xs">
          © 2026 Redreemer. Built for those who need it most.
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[460px]">
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>

          <h2 className="font-heading font-bold text-2xl text-gray-900 mb-1">How will you use Redreemer?</h2>
          <p className="text-gray-500 text-sm mb-8">Choose the option that best describes you.</p>

          <div className="space-y-3 mb-8">
            {USER_TYPES.map(({ type, icon: Icon, title, desc }) => (
              <button
                key={type}
                onClick={() => setSelected(type)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  selected === type
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  selected === type ? 'bg-yellow-50' : 'bg-gray-100'
                }`}>
                  <Icon size={20} className={selected === type ? 'text-gray-800' : 'text-gray-500'} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                {selected === type && <CheckCircle size={18} className="text-gray-700 shrink-0" />}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!selected}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-base text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: selected ? 'linear-gradient(135deg, #ffe44d, #f5e000)' : '#e5e7eb' }}
          >
            Continue <ArrowRight size={18} />
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-gray-700 hover:underline font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
