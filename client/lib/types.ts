/**
 * AUTHENTICATION TYPES
 * TypeScript interfaces matching EXACTLY with backend responses
 * Backend: server/src/controllers/auth.controller.ts
 */

// ============================================
// AUTH FORM INPUTS (Client → Backend)
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'USER' | 'MERCHANT' | 'ADMIN';
}

// ============================================
// USER DATA (Backend → Client)
// ============================================

/**
 * AuthUser - Matches backend User model
 * Backend sends: { id: user._id, username, email, role }
 */
export interface AuthUser {
  id: string;              // MongoDB _id converted to string
  username: string;        // Always present in backend response
  email: string;           // Always present
  role: 'USER' | 'MERCHANT' | 'ADMIN';  // Enum values
  isActive?: boolean;      // Optional - only from /auth/me
  createdAt?: string;      // Optional - only from /auth/me
}

// ============================================
// API RESPONSES (Backend Standard Format)
// Backend: server/src/utils/response.ts
// ============================================

/**
 * Standard API Response Wrapper
 * ALL backend endpoints return this format
 */
export interface APIResponse<T = unknown> {
  success: boolean;        // true/false
  message: string;         // Human-readable message
  data?: T;               // Response payload
  error?: string;         // Error details (only if success=false)
  timestamp: string;      // ISO timestamp
}

/**
 * Auth Response - Login & Register
 * POST /auth/login
 * POST /auth/register
 * Returns: { success, message, data: { user, accessToken }, timestamp }
 */
export interface AuthResponse {
  user: {
    id: string;           // MongoDB _id as string
    username: string;
    email: string;
    role: 'USER' | 'MERCHANT' | 'ADMIN';
  };
  accessToken: string;    // JWT access token (15min)
  // NOTE: refreshToken is HttpOnly cookie, NOT in response body
}

/**
 * Get Me Response
 * GET /auth/me
 * Returns: { success, message, data: { user: {...} }, timestamp }
 */
export interface GetMeResponse {
  user: {
    id: string;           // MongoDB _id as string
    username: string;
    email: string;
    role: 'USER' | 'MERCHANT' | 'ADMIN';
    isActive: boolean;
    createdAt: string;
  };
}

/**
 * Refresh Token Response
 * POST /auth/refresh
 * Returns: { success, message, data: { accessToken }, timestamp }
 */
export interface RefreshTokenResponse {
  accessToken: string;
}

// ============================================
// TRANSACTION TYPES
// Backend: server/src/controllers/transaction.controller.ts
// ============================================

/**
 * Transaction Request Body
 * POST /transaction/simulate
 * Required: amount, currency, customerEmail
 */
export interface TransactionRequest {
  amount: number;          // Must be positive number, max 1,000,000
  currency: string;        // ISO 4217 code: USD, EUR, GBP, INR, JPY, CAD, AUD
  customerEmail: string;   // Valid email format
}

/**
 * Transaction Response
 * Returns: { success, message, data: TransactionData, timestamp }
 */
export interface TransactionData {
  transactionId: string;          // Format: TXN_<timestamp>_<hash>
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'REFUNDED';
  amount: number;
  currency: string;
  customerEmail: string;
  merchantId: string;             // User who processed transaction
  merchantEmail: string;
  merchantRole: 'USER' | 'MERCHANT' | 'ADMIN';
  timestamp: string;              // ISO format
  processingTime: string;         // e.g., "1000ms"
  fee: string;                    // Payment processor fee (2.9% + $0.30)
  netAmount: string;              // amount - fee
}

/**
 * Transaction History Item
 * GET /transaction/history
 */
export interface TransactionHistoryItem {
  transactionId: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'REFUNDED';
  amount: number;
  currency: string;
  customerEmail: string;
  timestamp: string;
}

/**
 * Transaction History Response
 * Returns: { success, message, data: HistoryData, timestamp }
 */
export interface TransactionHistoryResponse {
  merchantId: string;
  totalTransactions: number;
  transactions: TransactionHistoryItem[];
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * API Error Response
 * Thrown by backend error handler
 */
export interface APIErrorResponse {
  success: false;
  message: string;
  error: string;
  timestamp: string;
  statusCode?: number;
}

/**
 * Axios Error with API Response
 * Use this for type-safe error handling
 */
export interface AxiosAPIError {
  response?: {
    status: number;
    data: APIErrorResponse;
  };
  message: string;
}