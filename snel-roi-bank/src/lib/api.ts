const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

const isPublicAuthPath = (path: string) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.startsWith('/auth/');
};

const getErrorMessage = (errorBody: unknown): string => {
  if (!errorBody || typeof errorBody !== 'object') return 'Request failed';

  const body = errorBody as Record<string, unknown>;

  if (typeof body.detail === 'string' && body.detail.trim()) return body.detail;

  const messages = body.messages;
  if (Array.isArray(messages) && messages.length > 0) {
    const first = messages[0] as Record<string, unknown>;
    const message = first?.message;
    if (typeof message === 'string' && message.trim()) return message;
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

  const { auth: _auth, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: 'Request failed' }));
    const message = getErrorMessage(errorBody);

    if (
      response.status === 401 &&
      token &&
      typeof message === 'string' &&
      message.toLowerCase().includes('token')
    ) {
      localStorage.removeItem('snel-roi-token');
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
