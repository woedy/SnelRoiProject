import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/transactions', label: 'Transactions' },
  { to: '/users', label: 'Users' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/loans', label: 'Loans' },
  { to: '/tax-refunds', label: 'Tax Refunds' },
  { to: '/crypto-wallets', label: 'Crypto Wallets' },
  { to: '/virtual-cards', label: 'Virtual Cards' },
  { to: '/kyc', label: 'KYC Management' },
]

export default function Layout() {
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/transactions" className="text-lg font-semibold">SnelROI Admin</Link>
          <button
            onClick={handleLogout}
            className="rounded bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
        <aside className="w-48">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-800' : 'text-slate-300 hover:bg-slate-900'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
