import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { MockAuth0Provider } from './lib/MockAuth0Provider.jsx'
import App from './App.jsx'
import './index.css'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

const Provider = isMock
  ? MockAuth0Provider
  : ({ children }) => (
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }}
      >
        {children}
      </Auth0Provider>
    )

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
)
