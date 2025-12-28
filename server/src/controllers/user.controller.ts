/**
 * USER CONTROLLER - Admin User Management
 ** "This controller implements admin-only user management features. Admins can view
 * all users and toggle their active status (ban/unban). This is crucial for platform
 * moderation and security - banned users cannot login even with valid credentials."
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types';
import { AppError, asyncHandler } from '@/middleware/errorHandler';
import { sendSuccess } from '@/utils/response';
import User from '@/models/User';

class UserController {
  /**
   * GET ALL USERS
   * 
   * GET /api/v1/users
   * Headers: Authorization: Bearer <access_token>
   * 
   * Access: ADMIN only (enforced by RBAC middleware)
   * 
   * Returns: Array of all users with basic information
   ** "This endpoint fetches all users for the admin dashboard. I exclude sensitive
   * fields like password and googleId using select. The isActive field is crucial
   * for admins to see which users are banned at a glance."
   */
  public static getAllUsers = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
      _next: NextFunction
    ): Promise<void> => {
      // Fetch all users with selected fields
      const users = await User.find()
        .select('_id username email role isActive createdAt updatedAt')
        .sort({ createdAt: -1 }) // Newest first
        .lean();

      // Format response
      const formattedUsers = users.map((user: any) => ({
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      sendSuccess(res, 'Users retrieved successfully', {
        users: formattedUsers,
        total: formattedUsers.length,
      });
    }
  );

  /**
   * UPDATE USER STATUS (Ban/Unban)
   * 
   * PATCH /api/v1/users/:id/status
   * Headers: Authorization: Bearer <access_token>
   * Body: { isActive: boolean }
   * 
   * Access: ADMIN only (enforced by RBAC middleware)
   * 
   * Toggles the user's active status. Banned users (isActive=false) cannot login.
   ** "This implements a soft delete pattern - we don't remove user data, we just
   * deactivate accounts. This is important for audit trails and data integrity.
   * When a user tries to login, the auth controller checks isActive and blocks
   * banned users before generating tokens."
   */
  public static updateUserStatus = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
      _next: NextFunction
    ): Promise<void> => {
      const { id } = req.params;
      const { isActive } = req.body;

      // 1. VALIDATE INPUT
      if (typeof isActive !== 'boolean') {
        throw new AppError('isActive must be a boolean value', 400);
      }

      // 2. PREVENT SELF-BAN
      if (id === req.user?.userId) {
        throw new AppError('Admins cannot ban themselves', 400);
      }

      // 3. FIND AND UPDATE USER
      const user = await User.findById(id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // 4. CHECK IF USER IS ADMIN (Prevent banning other admins)
      if (user.role === 'ADMIN' && !isActive) {
        throw new AppError('Cannot ban other administrators', 403);
      }

      // 5. UPDATE STATUS
      user.isActive = isActive;
      await user.save();

      // 6. SEND RESPONSE
      sendSuccess(
        res,
        `User ${isActive ? 'activated' : 'banned'} successfully`,
        {
          user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
          },
        }
      );
    }
  );
}

export default UserController;
