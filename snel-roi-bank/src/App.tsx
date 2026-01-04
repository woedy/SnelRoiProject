import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { useEffect } from "react";

// Public Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Features from "./pages/Features";
import Security from "./pages/Security";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Feature Detail Pages
import DashboardFeature from "./pages/features/Dashboard";
import TransfersFeature from "./pages/features/Transfers";
import SavingsFeature from "./pages/features/Savings";
import SecurityFeature from "./pages/features/Security";
import StatementsFeature from "./pages/features/Statements";
import MultilangFeature from "./pages/features/Multilang";
import MobileFeature from "./pages/features/Mobile";
import GlobalFeature from "./pages/features/Global";
import VirtualCardsFeature from "./pages/features/VirtualCards";

// App Pages
import Dashboard from "./pages/app/Dashboard";
import Deposit from "./pages/app/Deposit";
import Transfer from "./pages/app/Transfer";
import Withdraw from "./pages/app/Withdraw";
import Statements from "./pages/app/Statements";
import Transactions from "./pages/app/Transactions";
import Profile from "./pages/app/Profile";
import Settings from "./pages/app/Settings";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
              <Route path="/features" element={<PublicLayout><Features /></PublicLayout>} />
              <Route path="/features/dashboard" element={<PublicLayout><DashboardFeature /></PublicLayout>} />
              <Route path="/features/transfers" element={<PublicLayout><TransfersFeature /></PublicLayout>} />
              <Route path="/features/savings" element={<PublicLayout><SavingsFeature /></PublicLayout>} />
              <Route path="/features/security" element={<PublicLayout><SecurityFeature /></PublicLayout>} />
              <Route path="/features/statements" element={<PublicLayout><StatementsFeature /></PublicLayout>} />
              <Route path="/features/multilang" element={<PublicLayout><MultilangFeature /></PublicLayout>} />
              <Route path="/features/mobile" element={<PublicLayout><MobileFeature /></PublicLayout>} />
              <Route path="/features/global" element={<PublicLayout><GlobalFeature /></PublicLayout>} />
              <Route path="/features/virtual-cards" element={<PublicLayout><VirtualCardsFeature /></PublicLayout>} />
              <Route path="/security" element={<PublicLayout><Security /></PublicLayout>} />
              <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* App Routes */}
              <Route path="/app/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/app/deposit" element={<AppLayout><Deposit /></AppLayout>} />
              <Route path="/app/transfer" element={<AppLayout><Transfer /></AppLayout>} />
              <Route path="/app/withdraw" element={<AppLayout><Withdraw /></AppLayout>} />
              <Route path="/app/statements" element={<AppLayout><Statements /></AppLayout>} />
              <Route path="/app/transactions" element={<AppLayout><Transactions /></AppLayout>} />
              <Route path="/app/profile" element={<AppLayout><Profile /></AppLayout>} />
              <Route path="/app/settings" element={<AppLayout><Settings /></AppLayout>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
