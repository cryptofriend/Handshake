import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import AgentChatPage from "./pages/AgentChatPage";
import CounterpartyPage from "./pages/CounterpartyPage";
import SignPage from "./pages/SignPage";
import AgreementsPage from "./pages/AgreementsPage";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import AgentModePage from "./pages/AgentModePage";
import AgentDocsPage from "./pages/AgentDocsPage";
import { BottomNav } from "./components/handshake/BottomNav";

import { AppHeader } from "./components/handshake/AppHeader";
import RequireWallet from "./components/handshake/RequireWallet";
import { useTelegramStartParam } from "./hooks/useTelegramStartParam";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const isHome = false;

  // Handle Telegram Mini App startapp deep links
  useTelegramStartParam();

  return (
    <>
      {!isHome && <AppHeader />}
      <div className={isHome ? "" : "pb-16"}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/agent" element={<RequireWallet><AgentChatPage /></RequireWallet>} />
          <Route path="/sign" element={<RequireWallet><AgreementsPage /></RequireWallet>} />
          <Route path="/sign/:id" element={<SignPage />} />
          <Route path="/agreement/:id" element={<CounterpartyPage />} />
          <Route path="/agent-mode" element={<AgentModePage />} />
          <Route path="/docs/agents" element={<AgentDocsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isHome && <BottomNav />}
      
    </>
  );
};

const App = () => (
  <TonConnectUIProvider manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </TonConnectUIProvider>
);

export default App;
