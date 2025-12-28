import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '@/types';
import User from '@/models/User';
import TokenService from '@/services/token.service';
import { AppError, asyncHandler } from '@/middleware/errorHandler';
import { sendSuccess } from '@/utils/response';
import config from '@/config';

/**
 * AUTH CONTROLLER - User Authentication & Authorization
 ** "I implemented a stateless authentication system using JWT access tokens and HttpOnly refresh tokens.
 * The access tokens are short-lived (15min) for security, while refresh tokens (7 days) are stored
 * in HttpOnly cookies to prevent XSS attacks. This is the same dual-token pattern used by Auth0,
 * Firebase, and other enterprise authentication providers."
 */

class AuthController {
  /**
   * REGISTER NEW USER
   * 
   * POST /api/v1/auth/register
   * Body: { username, email, password }
   * 
   * Flow:
   * 1. Validate input (email, password format)
   * 2. Check if email already exists
   * 3. Create new user (password auto-hashed by pre-save hook)
   * 4. Generate access + refresh tokens
   * 5. Set refresh token in HttpOnly cookie
   * 6. Return access token in response body
   ** "I separate the access token (returned in JSON) from the refresh token (HttpOnly cookie).
   * The access token lives in client memory and is sent with each API request.
   * The refresh token cannot be accessed by JavaScript, preventing XSS theft.
   * This is the Payment-Grade standard for token storage."
   */
  public static register = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const { username, email, password, role } = req.body;

      // 1. VALIDATE INPUT
      if (!username || !email || !password) {
        throw new AppError(
          'Please provide username, email, and password',
          400
        );
      }

      if (password.length < 8) {
        throw new AppError(
          'Password must be at least 8 characters long',
          400
        );
      }

      // Validate role if provided
      const validRoles = Object.values(UserRole);
      const userRole = role && validRoles.includes(role) ? role : UserRole.USER;

      // 2. CHECK IF USER ALREADY EXISTS
      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        throw new AppError(
          'An account with this email already exists',
          400
        );
      }

      // 3. CREATE NEW USER
      // Password will be automatically hashed by the pre-save hook
      const user = await User.create({
        username,
        email: email.toLowerCase(),
        password,
        role: userRole, // Use validated role or default to USER
        provider: 'local',
      });

      // 4. GENERATE TOKENS
      const accessToken = TokenService.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const refreshToken = TokenService.generateRefreshToken({
        userId: user._id.toString(),
      });

      // 5. SET REFRESH TOKEN IN HTTP-ONLY COOKIE
      // Hybrid configuration: Supports HTTPS (Vercel/Render) and HTTP (AWS EC2 demo)
      const cookieOptions = {
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        secure: process.env.ALLOW_INSECURE_COOKIES === 'true' 
          ? false 
          : config.NODE_ENV === 'production', // Force false for AWS demo
        sameSite: (process.env.ALLOW_INSECURE_COOKIES === 'true' 
          ? 'lax' 
          : config.NODE_ENV === 'production' 
            ? 'none' 
            : 'lax') as 'lax' | 'none' | 'strict', // 'none' required for cross-site HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      };
      res.cookie('jwt', refreshToken, cookieOptions);

      // 6. SEND RESPONSE (password excluded by schema toJSON transform)
      sendSuccess(
        res,
        'Registration successful',
        {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          accessToken,
        },
        201
      );
    }
  );

  /**
   * LOGIN USER
   * 
   * POST /api/v1/auth/login
   * Body: { email, password }
   * 
   * Flow:
   * 1. Find user by email (include password field)
   * 2. Verify password using bcrypt comparison
   * 3. Check if account is active
   * 4. Generate tokens
   * 5. Set refresh token cookie
   * 6. Return access token
   ** "I use bcrypt's compare function which is timing-attack resistant - it takes
   * the same amount of time regardless of whether the password is correct.
   * This prevents attackers from inferring information based on response times."
   */
  public static login = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const { email, password } = req.body;

      // 1. VALIDATE INPUT
      if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
      }

      // 2. FIND USER (explicitly select password field)
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        provider: 'local' 
      }).select('+password');

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // 3. VERIFY PASSWORD
      const isPasswordCorrect = await user.comparePassword(password);

      if (!isPasswordCorrect) {
        throw new AppError('Invalid email or password', 401);
      }

      // 4. CHECK IF ACCOUNT IS ACTIVE
      if (!user.isActive) {
        throw new AppError(
          'Your account has been deactivated. Please contact support.',
          403
        );
      }

      // 5. GENERATE TOKENS
      const accessToken = TokenService.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const refreshToken = TokenService.generateRefreshToken({
        userId: user._id.toString(),
      });

      // 6. SET REFRESH TOKEN IN HTTP-ONLY COOKIE
      // Hybrid configuration: Supports HTTPS (Vercel/Render) and HTTP (AWS EC2 demo)
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.ALLOW_INSECURE_COOKIES === 'true' 
          ? false 
          : config.NODE_ENV === 'production',
        sameSite: (process.env.ALLOW_INSECURE_COOKIES === 'true' 
          ? 'lax' 
          : config.NODE_ENV === 'production' 
            ? 'none' 
            : 'lax') as 'lax' | 'none' | 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };
      res.cookie('jwt', refreshToken, cookieOptions);

      // 7. SEND RESPONSE
      sendSuccess(res, 'Login successful', {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        accessToken,
      });
    }
  );

  /**
   * LOGOUT USER
   * 
   * POST /api/v1/auth/logout
   * 
   * Flow:
   * 1. Clear the refresh token cookie
   * 2. Return success message
   * 
   * Note: Access tokens cannot be invalidated (stateless), but they expire in 15 minutes.
   * For immediate revocation, you'd need a token blacklist (adds state, reduces scalability).
   ** "Logout clears the refresh token cookie. The access token remains valid until expiration,
   * but since it's only valid for 15 minutes, the security risk is minimal. For high-security
   * applications, we could implement a token blacklist using Redis, but that adds state and
   * reduces scalability. This is an acceptable tradeoff for most applications."
   */
  public static logout = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
      // Clear the refresh token cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.ALLOW_INSECURE_COOKIES === 'true' 
          ? false 
          : config.NODE_ENV === 'production',
        sameSite: (process.env.ALLOW_INSECURE_COOKIES === 'true' 
          ? 'lax' 
          : config.NODE_ENV === 'production' 
            ? 'none' 
            : 'lax') as 'lax' | 'none' | 'strict',
      };
      res.cookie('jwt', '', {
        ...cookieOptions,
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
      });

      sendSuccess(res, 'Logout successful');
    }
  );

  /**
   * REFRESH ACCESS TOKEN
   * 
   * POST /api/v1/auth/refresh
   * 
   * Flow:
   * 1. Extract refresh token from HttpOnly cookie
   * 2. Verify refresh token signature
   * 3. Check if user still exists (account not deleted)
   * 4. Check if account is still active
   * 5. Generate new access token
   * 6. Return new access token
   ** "The refresh endpoint allows the client to obtain a new access token without
   * re-authenticating. We verify the user still exists to handle edge cases where
   * the account was deleted after the refresh token was issued. This is a database
   * query, but it only happens once every 15 minutes, not on every request."
   */
  public static refreshToken = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      // 1. EXTRACT REFRESH TOKEN FROM COOKIE
      const refreshToken = req.cookies?.jwt;

      if (!refreshToken) {
        throw new AppError(
          'Refresh token not found. Please log in again.',
          401
        );
      }

      // 2. VERIFY REFRESH TOKEN
      // This throws an AppError if token is invalid/expired
      const decoded = TokenService.verifyRefreshToken(refreshToken);

      // 3. CHECK IF USER STILL EXISTS
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new AppError(
          'User no longer exists. Please log in again.',
          401
        );
      }

      // 4. CHECK IF ACCOUNT IS ACTIVE
      if (!user.isActive) {
        throw new AppError(
          'Your account has been deactivated. Please contact support.',
          403
        );
      }

      // 5. GENERATE NEW ACCESS TOKEN
      const newAccessToken = TokenService.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // 6. SEND NEW ACCESS TOKEN
      sendSuccess(res, 'Token refreshed successfully', {
        accessToken: newAccessToken,
      });
    }
  );

  /**
   * GET CURRENT USER
   * 
   * GET /api/v1/auth/me
   * Headers: Authorization: Bearer <access_token>
   * 
   * Flow:
   * 1. User is already attached to req by protect middleware
   * 2. Optionally fetch full user details from database
   * 3. Return user information
   ** "This endpoint demonstrates stateless authentication. The protect middleware
   * verified the JWT and attached the user to the request. We could return just
   * req.user (0 DB queries), or fetch the full user profile if we need additional
   * fields not in the JWT. This is a design decision based on your use case."
   */
  public static getMe = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
      _next: NextFunction
    ): Promise<void> => {
      // Option 1: Return just the JWT payload (0 DB queries - truly stateless)
      if (!req.user) {
        throw new AppError('User not found in request', 401);
      }

      // Option 2: Fetch full user details from database
      // Uncomment if you need additional fields not in JWT
      const user = await User.findById(req.user?.userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      sendSuccess(res, 'User retrieved successfully', {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    }
  );
}

export default AuthController;
