import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api'

interface LedgerEntry {
  id: number
  reference: string
  entry_type: string
  status: string
  created_at: string
  memo: string
}

export default function Transactions() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [status, setStatus] = useState('PENDING')
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await apiRequest(`/admin/transactions?status=${status}`)
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }

  useEffect(() => {
    load()
  }, [status])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pending Transactions</h2>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        >
          <option value="PENDING">Pending</option>
          <option value="POSTED">Posted</option>
          <option value="DECLINED">Declined</option>
        </select>
      </div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <div className="mt-4 space-y-2">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            to={`/transactions/${entry.id}`}
            className="block rounded border border-slate-800 bg-slate-900 px-4 py-3 hover:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{entry.entry_type}</p>
                <p className="text-xs text-slate-400">{entry.reference}</p>
              </div>
              <span className="text-xs text-slate-300">{entry.status}</span>
            </div>
            {entry.memo && <p className="mt-2 text-xs text-slate-400">{entry.memo}</p>}
          </Link>
        ))}
      </div>
    </div>
  )
}
