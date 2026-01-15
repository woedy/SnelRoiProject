import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; email: string; username: string; is_staff: boolean } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('snel-roi-token'));
  });
  const [user, setUser] = useState<AuthContextType['user']>(null);

  const login = async (email: string, password: string) => {
    const data = await apiRequest<{ access: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('snel-roi-token', data.access);
    const me = await apiRequest<AuthContextType['user']>('/me');
    setUser(me);
    setIsAuthenticated(true);
  };

  const register = async (email: string, password: string, fullName: string) => {
    const data = await apiRequest<{ access: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    localStorage.setItem('snel-roi-token', data.access);
    const me = await apiRequest<AuthContextType['user']>('/me');
    setUser(me);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('snel-roi-token');
  };

  useEffect(() => {
    const token = localStorage.getItem('snel-roi-token');
    if (token) {
      apiRequest<AuthContextType['user']>('/me')
        .then((me) => {
          setUser(me);
          setIsAuthenticated(true);
        })
        .catch(() => {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('snel-roi-token');
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
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
