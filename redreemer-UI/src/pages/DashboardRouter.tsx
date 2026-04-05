import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '@/context/AuthContext';
import CaseworkerDashboard from './dashboards/CaseworkerDashboard';
import ClientDashboard from './dashboards/ClientDashboard';

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

export default function DashboardRouter() {
  const { isAuthenticated, isLoading } = useAuth0();
  const { userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // In mock mode, skip auth check entirely
    if (MOCK_MODE) return;
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, isLoading]);

  // Mock mode — show dashboard based on stored userType, default to caseworker for demo
  if (MOCK_MODE) {
    if (userType === 'homeless' || userType === 'reentry') return <ClientDashboard />;
    return <CaseworkerDashboard />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            <img src="/reverse-logo.png" alt="Redreemer" className="w-full h-full" />
          </div>
          <div className="text-gray-500 text-sm animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (userType === 'caseworker') return <CaseworkerDashboard />;
  if (userType === 'homeless' || userType === 'reentry') return <ClientDashboard />;

  navigate('/signup');
  return null;
}
