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

// Placeholders for other routes
// Placeholders for other routes
const SettingsPage = () => <div className="p-4">Settings (Coming Soon)</div>;

function App() {
  return (
      <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<RequireAuth />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="crypto-wallets" element={<CryptoWallets />} />
          <Route path="support" element={<CustomerSupport />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      </Routes>
  );
}

export default App;
