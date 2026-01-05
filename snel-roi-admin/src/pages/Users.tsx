import { useEffect, useState } from 'react'
import { apiRequest } from '../api'

interface User {
  id: number
  email: string
  username: string
  is_staff: boolean
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/admin/users')
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
  }, [])

  return (
    <div>
      <h2 className="text-lg font-semibold">Users</h2>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <ul className="mt-4 space-y-2">
        {users.map((user) => (
          <li key={user.id} className="rounded border border-slate-800 bg-slate-900 px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span>{user.email}</span>
              {user.is_staff && <span className="text-xs text-emerald-400">Staff</span>}
            </div>
            <p className="text-xs text-slate-400">{user.username}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
