/**
 * Mock Auth0 provider for local UI preview without real credentials.
 * Injects mock values into the real @auth0/auth0-react context so all
 * components using useAuth0() work without any changes.
 */
import { Auth0Context } from '@auth0/auth0-react'

const mockContextValue = {
  isAuthenticated: true,
  isLoading: false,
  user: { email: 'sarah@redreemer.app', name: 'Sarah Chen', sub: 'mock|caseworker' },
  loginWithRedirect: () => {},
  logout: () => {},
  getAccessTokenSilently: async () => 'mock_token',
  getIdTokenClaims: async () => ({}),
  handleRedirectCallback: async () => {},
  buildAuthorizeUrl: async () => '',
  buildLogoutUrl: () => '',
  error: undefined
}

export function MockAuth0Provider({ children }) {
  return (
    <Auth0Context.Provider value={mockContextValue}>
      {children}
    </Auth0Context.Provider>
  )
}
