import { Request, Response, NextFunction } from 'express';

/**
 * USER ROLES - Payment-Grade RBAC System
 * 
 * Role Hierarchy:
 * - User: Basic authenticated user (read-only access to own data)
 * - Merchant: Business account (can process transactions, view analytics)
 * - Admin: Full system access (user management, system configuration)
 */
export enum UserRole {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN'
}

/**
 * JWT Payload Interface
 * Contains all claims needed for stateless authentication
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;  // Issued At
  exp?: number;  // Expiration Time
}

/**
 * Extended Express Request with Authenticated User
 * Use Express.Request instead (extended via express.d.ts)
 * Keep this as a type alias for backwards compatibility
 */
export type AuthenticatedRequest = Request;

/**
 * Standard API Response Format
 * Ensures consistency across all endpoints
 */
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Session Information (for active sessions tracking)
 */
export interface SessionInfo {
  device: string;
  ip: string;
  userAgent: string;
  lastActive: Date;
  refreshTokenId: string;
}

/**
 * Express Async Handler Type
 * For proper async/await error handling in routes
 */
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Transaction Response Interface
 * Standard format for transaction-related responses
 */
export interface TransactionResponse {
  transactionId: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'REFUNDED';
  amount: number;
  currency: string;
  customerEmail: string;
  merchantId?: string;
  merchantEmail?: string;
  merchantRole?: UserRole;
  timestamp: string;
  processingTime?: string;
  fee?: string;
  netAmount?: string;
}

/**
 * Transaction Analytics Interface
 * For dashboard analytics data
 */
export interface TransactionAnalytics {
  merchantId: string;
  period: string;
  totalVolume: number;
  totalTransactions: number;
  successRate: number;
  averageTransactionValue: number;
  topCurrency: string;
  peakHour?: string;
  dailyVolume?: Array<{
    date: string;
    volume: number;
    count: number;
  }>;
}
