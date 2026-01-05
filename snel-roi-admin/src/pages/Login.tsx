import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!response.ok) {
        throw new Error('Invalid credentials')
      }
      const data = await response.json()
      localStorage.setItem('admin_token', data.access)
      navigate('/transactions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg bg-slate-900 p-6">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div>
          <label className="text-sm text-slate-400">Email</label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
            type="email"
            required
          />
        </div>
        <div>
          <label className="text-sm text-slate-400">Password</label>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
            type="password"
            required
          />
        </div>
        <button className="w-full rounded bg-emerald-500 py-2 text-sm font-semibold text-slate-900">
          Sign in
        </button>
      </form>
    </div>
  )
}
