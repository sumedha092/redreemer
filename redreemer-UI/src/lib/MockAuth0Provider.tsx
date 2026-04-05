/**
 * Local / demo auth when Auth0 env vars are not set (see App.tsx).
 * Keeps isAuthenticated true; loginWithRedirect sends users to /dashboard.
 */
import { type ReactNode } from 'react';
import { Auth0Context, type Auth0ContextInterface } from '@auth0/auth0-react';
import type { User } from '@auth0/auth0-spa-js';

const noopAsync = async () => undefined;

const mockUser: User = {
  sub: 'mock|redreemer-demo',
  name: 'Demo User',
  email: 'demo@redreemer.app',
  email_verified: true,
};

function goDashboard() {
  const base = window.location.origin;
  window.location.assign(`${base}/dashboard`);
}

const mockContextValue = {
  isAuthenticated: true,
  isLoading: false,
  user: mockUser,
  error: undefined,
  loginWithRedirect: async () => {
    goDashboard();
  },
  loginWithPopup: async () => goDashboard(),
  logout: () => {
    window.location.assign(window.location.origin);
  },
  getAccessTokenSilently: async () => 'mock_token',
  getAccessTokenWithPopup: async () => 'mock_token',
  getIdTokenClaims: async () => undefined,
  handleRedirectCallback: noopAsync,
  buildAuthorizeUrl: async () => '',
  buildLogoutUrl: () => '',
  loginWithCustomTokenExchange: async () => {
    throw new Error('Not available in mock mode');
  },
  exchangeToken: async () => {
    throw new Error('Not available in mock mode');
  },
  connectAccountWithRedirect: async () => {
    throw new Error('Not available in mock mode');
  },
  getDpopNonce: async () => '',
  setDpopNonce: async () => {},
  generateDpopProof: async () => '',
  createFetcher: () => {
    throw new Error('Not available in mock mode');
  },
  getConfiguration: () => ({
    domain: 'mock.local',
    clientId: 'mock',
    leeway: 0,
  }),
  mfa: {} as Auth0ContextInterface['mfa'],
} as unknown as Auth0ContextInterface<User>;

export function MockAuth0Provider({ children }: { children: ReactNode }) {
  return (
    <Auth0Context.Provider value={mockContextValue}>
      {children}
    </Auth0Context.Provider>
  );
}
