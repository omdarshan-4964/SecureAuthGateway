/**
 * AUTH CONTEXT & HOOK
 * Provides authentication state across the app
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from './axios';

interface AuthUser {
  id: string;
  username?: string;
  email: string;
  role: 'USER' | 'MERCHANT' | 'ADMIN';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Make sure axios has the token
      const response = await apiClient.get('/auth/me');
      
      const userData = response.data.data.user;
      
      // FIXED: Backend sends _id (MongoDB), handle both id and _id
      setUser({
        id: userData.id || userData._id || '',
        username: userData.username || userData.name || userData.email?.split('@')[0],
        email: userData.email,
        role: (userData.role?.toUpperCase() || 'USER') as 'USER' | 'MERCHANT' | 'ADMIN',
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
