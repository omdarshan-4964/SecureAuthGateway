/**
 * API CLIENT - Type-Safe API Calls
 * Centralized API methods matching backend endpoints
 * 
 * Backend Base URL: http://localhost:5000/api/v1
 * All responses follow format: { success, message, data, timestamp }
 */

import apiClient from './axios';
import type {
  APIResponse,
  AuthResponse,
  GetMeResponse,
  RefreshTokenResponse,
  TransactionRequest,
  TransactionData,
  TransactionHistoryResponse,
  LoginFormData,
  RegisterFormData,
} from './types';

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * POST /auth/register
 * Register a new user account
 * 
 * @param data - { username, email, password, role }
 * @returns { user, accessToken }
 * @note refreshToken is set as HttpOnly cookie automatically
 */
export const register = async (data: Omit<RegisterFormData, 'confirmPassword'>) => {
  const response = await apiClient.post<APIResponse<AuthResponse>>('/auth/register', data);
  return response.data.data!;
};

/**
 * POST /auth/login
 * Authenticate user and get tokens
 * 
 * @param data - { email, password }
 * @returns { user, accessToken }
 * @note refreshToken is set as HttpOnly cookie automatically
 */
export const login = async (data: LoginFormData) => {
  const response = await apiClient.post<APIResponse<AuthResponse>>('/auth/login', data);
  return response.data.data!;
};

/**
 * POST /auth/logout
 * Clear refresh token cookie
 * 
 * @returns void
 * @note Access token must be cleared by client
 */
export const logout = async () => {
  const response = await apiClient.post<APIResponse<void>>('/auth/logout');
  return response.data;
};

/**
 * POST /auth/refresh
 * Get new access token using refresh token from cookie
 * 
 * @returns { accessToken }
 * @note Requires valid refresh token in HttpOnly cookie
 */
export const refreshToken = async () => {
  const response = await apiClient.post<APIResponse<RefreshTokenResponse>>('/auth/refresh');
  return response.data.data!;
};

/**
 * GET /auth/me
 * Get current authenticated user details
 * 
 * @returns { user: { id, username, email, role, isActive, createdAt } }
 * @requires Authorization header with Bearer token
 */
export const getMe = async () => {
  const response = await apiClient.get<APIResponse<GetMeResponse>>('/auth/me');
  return response.data.data!;
};

// ============================================
// TRANSACTION ENDPOINTS (RBAC Protected)
// Requires: MERCHANT or ADMIN role
// ============================================

/**
 * POST /transaction/simulate
 * Simulate a payment transaction (Mock payment processor)
 * 
 * @param data - { amount, currency, customerEmail }
 * @returns TransactionData with transaction details
 * @requires MERCHANT or ADMIN role
 * @throws 403 if user role is USER
 * @throws 400 if validation fails
 * @throws 402 if transaction declined (10% random failure)
 */
export const simulateTransaction = async (data: TransactionRequest) => {
  const response = await apiClient.post<APIResponse<TransactionData>>(
    '/transaction/simulate',
    data
  );
  return response.data.data!;
};

/**
 * GET /transaction/history
 * Get transaction history for current merchant
 * 
 * @returns List of past transactions
 * @requires MERCHANT or ADMIN role
 */
export const getTransactionHistory = async () => {
  const response = await apiClient.get<APIResponse<TransactionHistoryResponse>>(
    '/transaction/history'
  );
  return response.data.data!;
};

/**
 * GET /transaction/analytics
 * Get transaction analytics dashboard data
 * 
 * @returns Analytics data (volume, success rate, etc.)
 * @requires MERCHANT or ADMIN role
 */
export const getTransactionAnalytics = async () => {
  const response = await apiClient.get<APIResponse<Record<string, unknown>>>('/transaction/analytics');
  return response.data.data!;
};

// ============================================
// TYPE-SAFE API CLIENT EXPORT
// ============================================

const api = {
  auth: {
    register,
    login,
    logout,
    refreshToken,
    getMe,
  },
  transactions: {
    simulate: simulateTransaction,
    getHistory: getTransactionHistory,
    getAnalytics: getTransactionAnalytics,
  },
};

export default api;
