import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { demoUser, DemoUser } from '@/data/demoData';

interface AuthContextType {
  isAuthenticated: boolean;
  user: DemoUser | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('snel-roi-auth') === 'true';
  });
  const [user, setUser] = useState<DemoUser | null>(() => {
    return localStorage.getItem('snel-roi-auth') === 'true' ? demoUser : null;
  });

  const login = () => {
    setIsAuthenticated(true);
    setUser(demoUser);
    localStorage.setItem('snel-roi-auth', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('snel-roi-auth');
  };

  useEffect(() => {
    const storedAuth = localStorage.getItem('snel-roi-auth') === 'true';
    setIsAuthenticated(storedAuth);
    setUser(storedAuth ? demoUser : null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
