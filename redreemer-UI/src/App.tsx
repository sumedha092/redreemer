import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Auth0Provider, AppState } from "@auth0/auth0-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { AIAlertProvider } from "@/context/AIAlertContext";
import Index from "./pages/Index.tsx";
import DashboardRouter from "./pages/DashboardRouter.tsx";
import FinancialWellness from "./pages/FinancialWellness.tsx";
import Signup from "./pages/Signup.tsx";
import Login from "./pages/Login.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import NotFound from "./pages/NotFound.tsx";
import { getAuthRedirectUri } from "@/lib/authOrigin";
import { getAuth0Audience, getAuth0ClientId, getAuth0Domain } from "@/lib/auth0Env";
import type { ReactNode } from "react";
import { LocaleProvider } from "@/context/LocaleContext";

const queryClient = new QueryClient();

function Auth0ProviderWithNavigate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const domain = getAuth0Domain();
  const clientId = getAuth0ClientId();
  const audience = getAuth0Audience();

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: getAuthRedirectUri(),
        scope: 'openid profile email',
        ...(audience ? { audience } : {}),
      }}
      onRedirectCallback={(appState?: AppState) => {
        navigate(appState?.returnTo ?? "/dashboard", { replace: true });
      }}
    >
      {children}
    </Auth0Provider>
  );
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <LocaleProvider>
    <Auth0ProviderWithNavigate>
      <AuthProvider>
        <AIAlertProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/callback" element={<AuthCallback />} />
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/wellness" element={<FinancialWellness />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </QueryClientProvider>
        </AIAlertProvider>
      </AuthProvider>
    </Auth0ProviderWithNavigate>
    </LocaleProvider>
  </BrowserRouter>
);

export default App;
