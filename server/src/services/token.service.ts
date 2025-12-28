import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import config from '@/config';
import { JWTPayload } from '@/types';
import { AppError } from '@/middleware/errorHandler';

/**
 * TOKEN SERVICE - Stateless JWT Authentication
 ** "I implemented a dual-token system (Access + Refresh) which is the industry standard.
 * - Access tokens are short-lived (15min) and contain user claims
 * - Refresh tokens are long-lived (7 days) and stored in HttpOnly cookies
 * - This balances security (stolen access tokens expire quickly) with UX (users stay logged in)
 * - This is the same approach used by Auth0, Firebase, and AWS Cognito"
 */

class TokenService {
  /**
   * GENERATE ACCESS TOKEN
   * 
   * Purpose: Short-lived token for API authentication
   * Expiry: 15 minutes
   * Storage: Client memory (NOT localStorage - XSS vulnerability)
   ** "Access tokens are stateless - they contain all the information needed for authorization.
   * The server just verifies the signature and trusts the payload. This enables horizontal scaling
   * without sticky sessions or distributed session stores."
   */
  public static generateAccessToken(payload: JWTPayload): string {
    const options: SignOptions = {
      expiresIn: config.JWT_ACCESS_EXPIRY as any,
      issuer: 'secureauth-gateway',
      audience: 'secureauth-api',
    };

    return jwt.sign(payload, config.JWT_ACCESS_SECRET, options);
  }

  /**
   * GENERATE REFRESH TOKEN
   * 
   * Purpose: Long-lived token for obtaining new access tokens
   * Expiry: 7 days
   * Storage: HttpOnly cookie (immune to XSS attacks)
   ** "Refresh tokens should have minimal claims (just userId) to reduce attack surface.
   * They're stored in HttpOnly cookies which JavaScript cannot access, preventing XSS theft.
   * If a refresh token is compromised, we can revoke it server-side (unlike access tokens)."
   */
  public static generateRefreshToken(payload: Pick<JWTPayload, 'userId'>): string {
    const options: SignOptions = {
      expiresIn: config.JWT_REFRESH_EXPIRY as any,
      issuer: 'secureauth-gateway',
      audience: 'secureauth-api',
    };

    return jwt.sign(payload, config.JWT_REFRESH_SECRET, options);
  }

  /**
   * VERIFY ACCESS TOKEN
   * 
   * Returns decoded payload if valid
   * Throws AppError if invalid/expired
   ** "Token verification is cryptographic - we check the signature using the same secret.
   * If the token was tampered with, the signature won't match and verification fails.
   * We also check expiration to ensure tokens can't be used indefinitely."
   */
  public static verifyAccessToken(token: string): JWTPayload {
    try {
      const options: VerifyOptions = {
        issuer: 'secureauth-gateway',
        audience: 'secureauth-api',
      };

      const decoded = jwt.verify(
        token,
        config.JWT_ACCESS_SECRET,
        options
      ) as JWTPayload;

      return decoded;
    } catch (error: any) {
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Access token has expired', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid access token', 401);
      }
      if (error.name === 'NotBeforeError') {
        throw new AppError('Access token not yet valid', 401);
      }

      // Generic error
      throw new AppError('Token verification failed', 401);
    }
  }

  /**
   * VERIFY REFRESH TOKEN
   * 
   * Returns decoded payload if valid
   * Throws AppError if invalid/expired
   ** "Refresh tokens use a different secret than access tokens.
   * This implements the principle of separation of concerns - if one secret is compromised,
   * the other remains secure. In production, these would be rotated periodically."
   */
  public static verifyRefreshToken(token: string): Pick<JWTPayload, 'userId'> {
    try {
      const options: VerifyOptions = {
        issuer: 'secureauth-gateway',
        audience: 'secureauth-api',
      };

      const decoded = jwt.verify(
        token,
        config.JWT_REFRESH_SECRET,
        options
      ) as Pick<JWTPayload, 'userId'>;

      return decoded;
    } catch (error: any) {
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token has expired. Please log in again.', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid refresh token', 401);
      }
      if (error.name === 'NotBeforeError') {
        throw new AppError('Refresh token not yet valid', 401);
      }

      // Generic error
      throw new AppError('Refresh token verification failed', 401);
    }
  }

  /**
   * DECODE TOKEN WITHOUT VERIFICATION
   * 
   * Useful for debugging or extracting claims without validation
   * NEVER use this for authentication - always verify first!
   ** "This is useful for logging or debugging, but should NEVER be used for authentication.
   * Decoding doesn't check the signature, so anyone could forge a token with fake claims."
   */
  public static decodeToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

export default TokenService;
