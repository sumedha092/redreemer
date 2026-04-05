import { createContext, useContext, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export type UserType = 'caseworker' | 'homeless' | 'reentry' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ReturnType<typeof useAuth0>['user'];
  userType: UserType;
  setUserType: (t: UserType) => void;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: false,
  user: undefined,
  userType: null,
  setUserType: () => {},
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user, loginWithRedirect, logout: auth0Logout } = useAuth0();

  // Persist user type in localStorage
  const userType = (localStorage.getItem('redreemer-user-type') as UserType) || null;

  function setUserType(t: UserType) {
    if (t) localStorage.setItem('redreemer-user-type', t);
    else localStorage.removeItem('redreemer-user-type');
  }

  function login() {
    loginWithRedirect({ appState: { returnTo: '/dashboard' } });
  }

  function logout() {
    localStorage.removeItem('redreemer-user-type');
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, userType, setUserType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
