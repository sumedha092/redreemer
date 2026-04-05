import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { AIAlertProvider } from "@/context/AIAlertContext";
import { MockAuth0Provider } from "@/lib/MockAuth0Provider";
import Index from "./pages/Index.tsx";
import DashboardRouter from "./pages/DashboardRouter.tsx";
import FinancialWellness from "./pages/FinancialWellness.tsx";
import Signup from "./pages/Signup.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";
import MissingAuth0Config from "./pages/MissingAuth0Config.tsx";

const queryClient = new QueryClient();

const domain = import.meta.env.VITE_AUTH0_DOMAIN?.trim();
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID?.trim();
const mockMode = import.meta.env.VITE_MOCK_MODE === "true";
const hasAuth0 = Boolean(domain && clientId);
/** Dev: no .env → mock auth so URLs never become https://undefined/authorize */
const useMockAuth = mockMode || (import.meta.env.DEV && !hasAuth0);

const appTree = (
  <AuthProvider>
    <AIAlertProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard/*" element={<DashboardRouter />} />
              <Route path="/wellness" element={<FinancialWellness />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AIAlertProvider>
  </AuthProvider>
);

const App = () => {
  if (import.meta.env.PROD && !hasAuth0 && !mockMode) {
    return <MissingAuth0Config />;
  }

  if (useMockAuth) {
    return <MockAuth0Provider>{appTree}</MockAuth0Provider>;
  }

  return (
    <Auth0Provider
      domain={domain!}
      clientId={clientId!}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/dashboard`,
        ...(import.meta.env.VITE_AUTH0_AUDIENCE?.trim()
          ? { audience: import.meta.env.VITE_AUTH0_AUDIENCE.trim() }
          : {}),
      }}
    >
      {appTree}
    </Auth0Provider>
  );
};

export default App;
