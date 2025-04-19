import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { UserAPI } from '../api/entities';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await UserAPI.me();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    fetchUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setError(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  if (!isInitialized) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 