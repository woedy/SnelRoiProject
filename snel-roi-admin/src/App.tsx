import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import RequireAuth from "./components/auth/RequireAuth";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";
import Accounts from "./pages/Accounts";
import CryptoWallets from "./pages/CryptoWallets";
import CustomerSupport from "./pages/CustomerSupport";
import VirtualCardsFixed from "./pages/VirtualCardsFixed";
import LoanManagement from "./pages/LoanManagement";
import KYCManagement from "./pages/KYCManagement";
import TaxRefundManagement from "./pages/TaxRefundManagement";
import ActivityLog from "./pages/ActivityLog";
import UserDetail from "./pages/UserDetail";
import VerificationCodes from "./pages/VerificationCodes";
import Settings from "./pages/Settings";
import Emails from "./pages/Emails";


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="loans" element={<LoanManagement />} />
          <Route path="virtual-cards" element={<VirtualCardsFixed />} />
          <Route path="crypto-wallets" element={<CryptoWallets />} />
          <Route path="kyc" element={<KYCManagement />} />
          <Route path="tax-refunds" element={<TaxRefundManagement />} />
          <Route path="activity-log" element={<ActivityLog />} />
          <Route path="support" element={<CustomerSupport />} />
          <Route path="verification-codes" element={<VerificationCodes />} />
          <Route path="emails" element={<Emails />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
