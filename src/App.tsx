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
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import { BottomNav } from "./components/handshake/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <TonConnectUIProvider manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="pb-16">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/agent" element={<AgentChatPage />} />
              <Route path="/sign/:id" element={<SignPage />} />
              
              <Route path="/agreement/:id" element={<CounterpartyPage />} />
              <Route path="/profile" element={<ProfilePage />} />
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
