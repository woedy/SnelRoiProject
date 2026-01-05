import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../api'

interface Posting {
  id: number
  account_number: string
  direction: string
  amount: string
  description: string
}

interface Entry {
  id: number
  reference: string
  entry_type: string
  status: string
  memo: string
  postings: Posting[]
}

export default function TransactionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await apiRequest(`/admin/transactions/${id}`)
      setEntry(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const handleAction = async (action: 'approve' | 'decline') => {
    try {
      await apiRequest(`/admin/transactions/${id}/${action}`, { method: 'POST' })
      navigate('/transactions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  if (!entry) {
    return <p className="text-sm text-slate-400">Loading...</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Transaction {entry.reference}</h2>
        <p className="text-sm text-slate-400">{entry.entry_type} • {entry.status}</p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="rounded border border-slate-800 bg-slate-900 p-4">
        <h3 className="text-sm font-semibold">Postings</h3>
        <ul className="mt-2 space-y-2">
          {entry.postings.map((posting) => (
            <li key={posting.id} className="flex items-center justify-between text-xs text-slate-300">
              <span>{posting.account_number} • {posting.direction}</span>
              <span>{posting.amount}</span>
            </li>
          ))}
        </ul>
      </div>
      {entry.status === 'PENDING' && (
        <div className="flex gap-3">
          <button
            onClick={() => handleAction('approve')}
            className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900"
          >
            Approve
          </button>
          <button
            onClick={() => handleAction('decline')}
            className="rounded bg-red-500 px-4 py-2 text-sm font-semibold text-slate-900"
          >
            Decline
          </button>
        </div>
      )}
    </div>
  )
}
