import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Accounts from './pages/Accounts'
import Login from './pages/Login'
import TransactionDetail from './pages/TransactionDetail'
import Transactions from './pages/Transactions'
import Users from './pages/Users'

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('admin_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/transactions" replace />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="transactions/:id" element={<TransactionDetail />} />
        <Route path="users" element={<Users />} />
        <Route path="accounts" element={<Accounts />} />
      </Route>
    </Routes>
  )
}
