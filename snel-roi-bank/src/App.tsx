import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { useEffect } from "react";

// Public Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
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
import ExternalTransfer from "./pages/app/ExternalTransfer";
import Withdraw from "./pages/app/Withdraw";
import Statements from "./pages/app/Statements";
import Transactions from "./pages/app/Transactions";
import Profile from "./pages/app/Profile";
import Settings from "./pages/app/Settings";
import VirtualCards from "./pages/app/VirtualCards";
import Help from "./pages/app/Help";
import Notifications from "./pages/app/Notifications";
import Loans from "./pages/app/Loans";
import LoanApplication from "./pages/app/LoanApplication";
import LoanDetail from "./pages/app/LoanDetail";
import Grants from "./pages/app/Grants";
import TaxRefund from "./pages/app/TaxRefund";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Wrapper component to conditionally apply theme provider
const ConditionalThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app/');
  
  if (isAppRoute) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <ConditionalThemeProvider>
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
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* App Routes */}
                  <Route path="/app/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                  <Route path="/app/deposit" element={<AppLayout><Deposit /></AppLayout>} />
                  <Route path="/app/transfer" element={<AppLayout><Transfer /></AppLayout>} />
                  <Route path="/app/external-transfer" element={<AppLayout><ExternalTransfer /></AppLayout>} />
                  <Route path="/app/withdraw" element={<AppLayout><Withdraw /></AppLayout>} />
                  <Route path="/app/loans" element={<AppLayout><Loans /></AppLayout>} />
                  <Route path="/app/loans/apply" element={<AppLayout><LoanApplication /></AppLayout>} />
                  <Route path="/app/loans/:id" element={<AppLayout><LoanDetail /></AppLayout>} />
                  <Route path="/app/grants" element={<AppLayout><Grants /></AppLayout>} />
                  <Route path="/app/tax-refund" element={<AppLayout><TaxRefund /></AppLayout>} />
                  <Route path="/app/virtual-cards" element={<AppLayout><VirtualCards /></AppLayout>} />
                  <Route path="/app/statements" element={<AppLayout><Statements /></AppLayout>} />
                  <Route path="/app/transactions" element={<AppLayout><Transactions /></AppLayout>} />
                  <Route path="/app/notifications" element={<AppLayout><Notifications /></AppLayout>} />
                  <Route path="/app/profile" element={<AppLayout><Profile /></AppLayout>} />
                  <Route path="/app/settings" element={<AppLayout><Settings /></AppLayout>} />
                  <Route path="/app/help" element={<AppLayout><Help /></AppLayout>} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ConditionalThemeProvider>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
