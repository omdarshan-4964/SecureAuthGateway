/**
 * AUTHENTICATION API HOOKS
 * React Query hooks for auth operations
 */

import { useMutation } from '@tanstack/react-query';
import apiClient from './axios';
import type { LoginFormData, RegisterFormData } from './types';

/**
 * Login Mutation Hook
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiClient.post('/auth/login', data);
      return response.data;
    },
    onSuccess: async (response) => {
      console.log('Login onSuccess - Full response:', response);
      
      // FIXED: Backend returns { success, message, data: { user, accessToken }, timestamp }
      const accessToken = response.data?.accessToken;
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        console.log('✅ Token stored successfully');
        
        // Add a small delay for better UX (show success message)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Force page reload to trigger AuthContext initialization
        window.location.href = '/dashboard';
      } else {
        console.error('❌ AccessToken missing! Response structure:', JSON.stringify(response, null, 2));
        throw new Error('Access token not found in server response');
      }
    },
  });
};

/**
 * Register Mutation Hook
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterFormData) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      const response = await apiClient.post('/auth/register', registerData);
      return response.data;
    },
    onSuccess: async (response) => {
      console.log('Register onSuccess - Full response:', response);
      console.log('✅ Account created successfully');
      
      // Add a small delay for better UX (show success message)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to login page - user must login after registration
      window.location.href = '/auth/login';
    },
  });
};

/**
 * Logout Mutation Hook
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      // Clear stored token
      localStorage.removeItem('accessToken');
      console.log('✅ Logged out successfully');
      // Redirect to login
      window.location.href = '/auth/login';
    },
  });
};
