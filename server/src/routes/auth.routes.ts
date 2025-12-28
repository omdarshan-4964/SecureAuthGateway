import { Router } from 'express';
import AuthController from '@/controllers/auth.controller';
import { protect } from '@/middleware/auth.middleware';

/**
 * AUTH ROUTES - Authentication & Authorization Endpoints
 ** "I organized routes into separate modules for maintainability and separation of concerns.
 * Each route module handles a specific domain (auth, users, transactions).
 * This modular approach makes it easier to add new features and test individual modules."
 */

const router = Router();

/**
 * PUBLIC ROUTES (No Authentication Required)
 */

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { username, email, password }
 * 
 * Response: { success, user, accessToken }
 * Cookie: jwt (refresh token, HttpOnly)
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and get tokens
 * @access  Public
 * @body    { email, password }
 * 
 * Response: { success, user, accessToken }
 * Cookie: jwt (refresh token, HttpOnly)
 */
router.post('/login', AuthController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (clears refresh token cookie)
 * @access  Public (but typically called by authenticated users)
 * 
 * Response: { success, message }
 */
router.post('/logout', AuthController.logout);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Get new access token using refresh token
 * @access  Public (requires valid refresh token cookie)
 * @cookie  jwt (refresh token)
 * 
 * Response: { success, accessToken }
 ** "The refresh endpoint is technically public, but it requires a valid refresh token
 * in the HttpOnly cookie. This allows the client to silently refresh the access token
 * when it expires, providing a seamless user experience without requiring re-login."
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * PROTECTED ROUTES (Authentication Required)
 */

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user information
 * @access  Private (requires valid access token)
 * @header  Authorization: Bearer <access_token>
 * 
 * Response: { success, user }
 ** "This endpoint demonstrates the protect middleware in action. The middleware verifies
 * the JWT and attaches the user to the request. This endpoint then returns the user's
 * information. It's commonly used by frontend applications to check authentication status
 * and get user details for the UI."
 */
router.get('/me', protect, AuthController.getMe);

export default router;
