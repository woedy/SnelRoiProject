import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { 
    id: number; 
    email: string; 
    username: string; 
    first_name: string;
    last_name: string;
    is_staff: boolean; 
    is_active: boolean;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<string>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => void;
  handleAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('snel-roi-token'));
  });
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleAuthError = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('snel-roi-token');
    localStorage.removeItem('snel-roi-refresh-token');
    // Redirect to login page
    window.location.href = '/login';
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ access: string; refresh: string }>('/auth/login/', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('snel-roi-token', data.access);
      localStorage.setItem('snel-roi-refresh-token', data.refresh);
      const me = await apiRequest<AuthContextType['user']>('/me/');
      setUser(me);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    const data = await apiRequest<{ email: string }>('/auth/register/', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    return data.email;
  };

  const verifyEmail = async (email: string, code: string) => {
    const data = await apiRequest<{ access: string; refresh: string }>('/auth/verify-email/', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, code }),
    });
    localStorage.setItem('snel-roi-token', data.access);
    localStorage.setItem('snel-roi-refresh-token', data.refresh);
    const me = await apiRequest<AuthContextType['user']>('/me/');
    setUser(me);
    setIsAuthenticated(true);
  };

  const resendVerification = async (email: string) => {
    await apiRequest('/auth/verify-email/resend/', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email }),
    });
  };

  const requestPasswordReset = async (email: string) => {
    await apiRequest('/auth/password-reset/request/', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email }),
    });
  };

  const confirmPasswordReset = async (email: string, code: string, newPassword: string) => {
    await apiRequest('/auth/password-reset/confirm/', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, code, new_password: newPassword }),
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('snel-roi-token');
    localStorage.removeItem('snel-roi-refresh-token');
  };

  useEffect(() => {
    const token = localStorage.getItem('snel-roi-token');
    if (token) {
      apiRequest<AuthContextType['user']>('/me/')
        .then((me) => {
          setUser(me);
          setIsAuthenticated(true);
        })
        .catch((error) => {
          console.error('Auth check failed:', error);
          // Only clear auth state if it's an auth error
          if (error.message.includes('Authentication credentials were not provided') || 
              error.message.includes('Invalid token') ||
              error.message.includes('Token')) {
            handleAuthError();
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, register, verifyEmail, resendVerification, requestPasswordReset, confirmPasswordReset, logout, handleAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
