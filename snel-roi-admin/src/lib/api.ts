const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('admin_token');
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
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      // Only redirect if not already on login page to avoid loops (though window.location.href is hard)
      // Ideally use a custom event or callback, but for now this works.
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const errorBody = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(errorBody.detail || 'Request failed');
  }
  return response.json();
};
