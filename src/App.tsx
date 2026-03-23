import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/LoginPage";
import CreateAgreementPage from "./pages/CreateAgreementPage";
import SignPage from "./pages/SignPage";
import SignedDocsPage from "./pages/SignedDocsPage";
import CounterpartyPage from "./pages/CounterpartyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/create" element={<CreateAgreementPage />} />
          <Route path="/sign" element={<SignPage />} />
          <Route path="/signed-docs" element={<SignedDocsPage />} />
          <Route path="/agreement/:id" element={<CounterpartyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
