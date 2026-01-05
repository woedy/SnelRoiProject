const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const apiRequest = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('admin_token')
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'Request failed')
  }
  return response.json()
}
