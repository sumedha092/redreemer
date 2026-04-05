import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import Logo from '@/components/Logo';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <Logo size="md" />
      <h1 className="font-heading font-extrabold text-7xl text-gray-900 mt-10 mb-2">404</h1>
      <p className="text-gray-500 text-lg mb-8">This page doesn't exist.</p>
      <button onClick={() => navigate('/')}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-900 hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
        <Home size={16} /> Back to Home
      </button>
    </div>
  );
}
