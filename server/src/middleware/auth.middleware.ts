import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types';
import { AppError } from './errorHandler';
import TokenService from '@/services/token.service';

/**
 * AUTHENTICATION MIDDLEWARE - Stateless JWT Verification
 ** "This middleware implements stateless authentication - it verifies the JWT signature
 * and attaches the payload to req.user WITHOUT querying the database. This is critical
 * for performance at scale. A single database query per request would become a bottleneck
 * when you're handling thousands of requests per second.
 * 
 * The tradeoff: If a user's role changes, they won't see the change until their access
 * token expires (15 minutes max). This is acceptable for most use cases and worth the
 * performance gain."
 */

/**
 * PROTECT MIDDLEWARE
 * 
 * Purpose: Verify JWT and attach user to request
 * Usage: Apply to any route that requires authentication
 * 
 * Flow:
 * 1. Extract token from Authorization header
 * 2. Verify token signature and expiration
 * 3. Attach decoded payload to req.user
 * 4. Continue to next middleware
 * 
 * Example:
 * router.get('/profile', protect, getUserProfile);
 */
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. CHECK IF TOKEN EXISTS
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Authentication required. Please provide a valid access token.',
        401
      );
    }

    // 2. EXTRACT TOKEN
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Access token is missing', 401);
    }

    // 3. VERIFY TOKEN
    // This throws an AppError if token is invalid/expired
    const decoded = TokenService.verifyAccessToken(token);

    // 4. ATTACH USER TO REQUEST (STATELESS - NO DB QUERY)
    // The decoded payload contains { userId, email, role }
    req.user = decoded;

    // 5. PROCEED TO NEXT MIDDLEWARE
    next();
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};

/**
 * OPTIONAL AUTHENTICATION MIDDLEWARE
 * 
 * Purpose: Attach user if token exists, but don't fail if missing
 * Usage: For routes that behave differently for authenticated vs anonymous users
 * 
 * Example:
 * router.get('/public-content', optionalAuth, getContent);
 * // Content might be personalized if user is logged in, but works without auth too
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // If no token, just continue without attaching user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    // Try to verify token, but don't fail if invalid
    try {
      const decoded = TokenService.verifyAccessToken(token);
      req.user = decoded;
    } catch (error) {
      // Silently fail - token was invalid but that's okay
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * VERIFY REFRESH TOKEN MIDDLEWARE
 * 
 * Purpose: Verify refresh token from HttpOnly cookie
 * Usage: Used in the /refresh-token endpoint
 ** "Refresh tokens are stored in HttpOnly cookies to prevent XSS attacks.
 * JavaScript cannot read HttpOnly cookies, so even if an attacker injects malicious code,
 * they can't steal the refresh token. This is a critical security measure for payment-grade systems."
 */
export const verifyRefreshToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. EXTRACT REFRESH TOKEN FROM COOKIE
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError(
        'Refresh token not found. Please log in again.',
        401
      );
    }

    // 2. VERIFY REFRESH TOKEN
    const decoded = TokenService.verifyRefreshToken(refreshToken);

    // 3. ATTACH MINIMAL USER INFO TO REQUEST
    // Refresh tokens only contain userId, not role/email
    req.user = { userId: decoded.userId } as any;

    // 4. PROCEED TO NEXT MIDDLEWARE
    next();
  } catch (error) {
    next(error);
  }
};
