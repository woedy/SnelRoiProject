const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('snel-roi-token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(errorBody.detail || 'Request failed');
  }
  return response.json();
};
