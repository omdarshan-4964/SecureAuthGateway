// lib/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if:
    // 1. No response (network error)
    // 2. Not a 401
    // 3. Already retried
    // 4. Login/register endpoints
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      // Only log meaningful errors
      if (error.response && error.response.status !== 401) {
        const errorInfo: any = {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        };
        
        if (error.response?.data) {
          errorInfo.data = error.response.data;
        }
        
        console.error('API Error:', errorInfo);
      }
      
      return Promise.reject(error);
    }

    // Handle token refresh
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    if (typeof window === 'undefined') {
      isRefreshing = false;
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      isRefreshing = false;
      processQueue(error, null);
      
      // Clear tokens and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth/login';
      
      return Promise.reject(error);
    }

    try {
      const response = await axiosInstance.post('/auth/refresh', { refreshToken });

      // Handle different response structures
      const newAccessToken = response.data?.data?.accessToken || response.data?.accessToken;
      
      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }
      
      localStorage.setItem('accessToken', newAccessToken);
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      
      processQueue(null, newAccessToken);
      isRefreshing = false;
      
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      
      // Clear tokens and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth/login';
      
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;