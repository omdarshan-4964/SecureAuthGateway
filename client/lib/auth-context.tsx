/**
 * AUTH CONTEXT & HOOK
 * Provides authentication state across the app
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from './axios';

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
      // Check for token in both localStorage and sessionStorage (axios uses sessionStorage)
      const accessToken = 
        (typeof window !== 'undefined' && sessionStorage.getItem('accessToken')) ||
        (typeof window !== 'undefined' && localStorage.getItem('accessToken')) ||
        null;
      
      // If no token exists, don't make the API call
      if (!accessToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Make sure axios has the token
      const response = await axiosInstance.get('/auth/me');
      
      // Handle response structure safely
      if (!response?.data?.data?.user) {
        throw new Error('Invalid response structure');
      }
      
      const userData = response.data.data.user;
      
      // FIXED: Backend sends _id (MongoDB), handle both id and _id
      setUser({
        id: userData.id || userData._id || '',
        username: userData.username || userData.name || userData.email?.split('@')[0],
        email: userData.email,
        role: (userData.role?.toUpperCase() || 'USER') as 'USER' | 'MERCHANT' | 'ADMIN',
      });
    } catch (error: any) {
      // Clear user state
      setUser(null);
      
      // Silently handle auth errors (401/403)
      const isAuthError = error?.response?.status === 401 || error?.response?.status === 403;
      
      if (isAuthError) {
        // Expected when user is not authenticated - clean up silently
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('accessToken');
        }
      } else if (process.env.NODE_ENV === 'development' && error?.message) {
        // Only log actual errors in development (not network/connection issues)
        if (error.message !== 'Network Error' && error.message !== 'Request failed with status code 401') {
          console.error('Failed to fetch user:', {
            message: error.message,
            status: error?.response?.status,
          });
        }
      }
      
      // Always clean up tokens on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
      }
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