const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
  _isRetry?: boolean; // Internal flag to prevent infinite retry loops
};

const isPublicAuthPath = (path: string) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.startsWith('/auth/');
};

// Token refresh function
const refreshToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('snel-roi-refresh-token');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      // Refresh token is invalid, clear all tokens
      localStorage.removeItem('snel-roi-token');
      localStorage.removeItem('snel-roi-refresh-token');
      return null;
    }

    const data = await response.json();
    localStorage.setItem('snel-roi-token', data.access);
    
    // If rotation is enabled, update refresh token too
    if (data.refresh) {
      localStorage.setItem('snel-roi-refresh-token', data.refresh);
    }
    
    return data.access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    localStorage.removeItem('snel-roi-token');
    localStorage.removeItem('snel-roi-refresh-token');
    return null;
  }
};

export const getErrorMessage = (errorBody: unknown): string => {
  if (!errorBody || typeof errorBody !== 'object') return 'Request failed';

  const body = errorBody as Record<string, unknown>;

  if (typeof body.detail === 'string' && body.detail.trim()) return body.detail;

  if (Array.isArray(body.non_field_errors) && body.non_field_errors.length > 0) {
    return body.non_field_errors.join(' ');
  }

  const messages = body.messages;
  if (Array.isArray(messages) && messages.length > 0) {
    const first = messages[0] as Record<string, unknown>;
    const message = first?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  // Fallback: Check for other field errors (e.g., "amount": ["Invalid amount"])
  const firstKey = Object.keys(body)[0];
  if (firstKey && Array.isArray(body[firstKey]) && body[firstKey].length > 0) {
    if (typeof body[firstKey][0] === 'string') {
      return `${firstKey}: ${body[firstKey][0]}`;
    }
  }

  return 'Request failed';
};



export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const token = localStorage.getItem('snel-roi-token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const shouldSendAuth = options.auth ?? !isPublicAuthPath(path);
  if (!shouldSendAuth) {
    headers.delete('Authorization');
  }
  if (shouldSendAuth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const { auth: _auth, _isRetry, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers,
  });

  // Handle 401 errors with token refresh
  if (response.status === 401 && shouldSendAuth && !_isRetry) {
    const newToken = await refreshToken();
    if (newToken) {
      // Retry the request with the new token
      return apiRequest<T>(path, { ...options, _isRetry: true });
    } else {
      // Refresh failed, redirect to login by throwing an auth error
      throw new Error('Authentication credentials were not provided.');
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: 'Request failed' }));
    console.error('API Error Response:', errorBody); // Debug log
    const message = getErrorMessage(errorBody);

    if (
      response.status === 401 &&
      token &&
      typeof message === 'string' &&
      message.toLowerCase().includes('token')
    ) {
      localStorage.removeItem('snel-roi-token');
      localStorage.removeItem('snel-roi-refresh-token');
    }

    throw new Error(message);
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
// API object with common HTTP methods
export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) => 
    apiRequest<T>(path, { ...options, method: 'GET' }),
  
  post: <T>(path: string, data?: any, options?: ApiRequestOptions) => 
    apiRequest<T>(path, { 
      ...options, 
      method: 'POST', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
  
  put: <T>(path: string, data?: any, options?: ApiRequestOptions) => 
    apiRequest<T>(path, { 
      ...options, 
      method: 'PUT', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
  
  patch: <T>(path: string, data?: any, options?: ApiRequestOptions) => 
    apiRequest<T>(path, { 
      ...options, 
      method: 'PATCH', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
  
  delete: <T>(path: string, options?: ApiRequestOptions) => 
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};