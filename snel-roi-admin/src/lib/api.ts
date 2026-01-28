const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

type ApiRequestOptions = RequestInit & {
  _isRetry?: boolean; // Internal flag to prevent infinite retry loops
};

// Token refresh function
const refreshToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('admin_refresh_token');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      // Refresh token is invalid, clear all tokens
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      return null;
    }

    const data = await response.json();
    localStorage.setItem('admin_token', data.access);
    
    // If rotation is enabled, update refresh token too
    if (data.refresh) {
      localStorage.setItem('admin_refresh_token', data.refresh);
    }
    
    return data.access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    return null;
  }
};

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const token = localStorage.getItem('admin_token');
  const headers = new Headers(options.headers);

  const isFormData = options.body instanceof FormData;

  if (!isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const { _isRetry, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers,
  });

  // Handle 401 errors with token refresh
  if (response.status === 401 && !_isRetry) {
    const newToken = await refreshToken();
    if (newToken) {
      // Retry the request with the new token
      return apiRequest<T>(path, { ...options, _isRetry: true });
    } else {
      // Refresh failed, redirect to login
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Authentication credentials were not provided.');
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      // Only redirect if not already on login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const errorBody = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(errorBody.detail || 'Request failed');
  }
  
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
};
