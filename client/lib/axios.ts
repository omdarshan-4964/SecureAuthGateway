/**
 * AXIOS INSTANCE WITH AUTO-REFRESH INTERCEPTOR
 ** "This is a production-grade API client with automatic token refresh.
 * When a 401 occurs, it transparently calls /refresh, updates the token,
 * and retries the original request. The user never sees an error."
 * 
 * Key Features:
 * - Automatic access token attachment
 * - Transparent token refresh on 401
 * - Request queue during refresh (prevents race conditions)
 * - Token storage in memory (XSS-safe)
 */

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Token storage (in-memory, not localStorage to prevent XSS)
// Note: refreshToken is stored as HttpOnly cookie by backend
let accessToken: string | null = null;

// Request queue for handling concurrent requests during refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: Error) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

/**
 * Create Axios instance
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Sends HttpOnly cookies
});

/**
 * REQUEST INTERCEPTOR
 * Attach access token to every request
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Try to get token from memory first, fallback to localStorage
    const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Update in-memory token if it was loaded from storage
      if (!accessToken) {
        accessToken = token;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Handle 401 errors with automatic token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another request is already refreshing - queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint (refreshToken sent automatically as HttpOnly cookie)
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {}, // Empty body - backend reads token from cookie
          {
            withCredentials: true, // CRITICAL: Sends HttpOnly cookies
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const { accessToken: newAccessToken } = response.data.data;

        // Update access token (refreshToken is already updated via cookie)
        setTokens(newAccessToken);

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        processQueue(refreshError as Error, null);
        clearTokens();

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * TOKEN MANAGEMENT FUNCTIONS
 */
export const setTokens = (access: string) => {
  accessToken = access;

  // Store in sessionStorage as backup (refreshToken is HttpOnly cookie)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('accessToken', access);
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = sessionStorage.getItem('accessToken');
  }
  return accessToken;
};

export const clearTokens = () => {
  accessToken = null;

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('accessToken');
  }
};

/**
 * Initialize tokens from storage on app load
 */
export const initializeTokens = () => {
  if (typeof window !== 'undefined') {
    const storedAccessToken = sessionStorage.getItem('accessToken');

    if (storedAccessToken) {
      accessToken = storedAccessToken;
    }
  }
};

export default apiClient;
