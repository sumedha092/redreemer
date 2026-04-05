import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '@/context/AuthContext';
import CaseworkerDashboard from './dashboards/CaseworkerDashboard';
import ClientDashboard from './dashboards/ClientDashboard';

export default function DashboardRouter() {
  const { isAuthenticated, isLoading } = useAuth0();
  const { userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (userType === 'caseworker') return <CaseworkerDashboard />;
  if (userType === 'homeless' || userType === 'reentry') return <ClientDashboard />;

  // No user type set — redirect to signup to choose
  navigate('/signup');
  return null;
}
