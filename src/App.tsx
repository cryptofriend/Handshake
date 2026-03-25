import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import LoginPage from "./pages/LoginPage";
import AgentChatPage from "./pages/AgentChatPage";
import CounterpartyPage from "./pages/CounterpartyPage";
import SignPage from "./pages/SignPage";
import AgreementsPage from "./pages/AgreementsPage";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import { BottomNav } from "./components/handshake/BottomNav";
import { AppHeader } from "./components/handshake/AppHeader";
import RequireWallet from "./components/handshake/RequireWallet";

const queryClient = new QueryClient();

const App = () => (
  <TonConnectUIProvider manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppHeader />
          <div className="pb-16">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/agent" element={<RequireWallet><AgentChatPage /></RequireWallet>} />
              <Route path="/sign" element={<RequireWallet><AgreementsPage /></RequireWallet>} />
              <Route path="/sign/:id" element={<RequireWallet><SignPage /></RequireWallet>} />
              <Route path="/agreement/:id" element={<CounterpartyPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </TonConnectUIProvider>
);

export default App;
