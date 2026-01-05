import { useEffect, useState } from 'react'
import { apiRequest } from '../api'

interface Account {
  id: number
  account_number: string
  type: string
  currency: string
  status: string
  balance: string
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/admin/accounts')
      .then(setAccounts)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [])

  return (
    <div>
      <h2 className="text-lg font-semibold">Accounts</h2>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <div className="mt-4 grid gap-3">
        {accounts.map((account) => (
          <div key={account.id} className="rounded border border-slate-800 bg-slate-900 px-4 py-3">
            <p className="text-sm font-semibold">{account.account_number}</p>
            <p className="text-xs text-slate-400">{account.type} • {account.currency}</p>
            <p className="text-xs text-slate-400">Balance: {account.balance}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
