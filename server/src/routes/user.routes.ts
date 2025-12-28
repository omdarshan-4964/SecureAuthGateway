/**
 * USER ROUTES - Admin User Management
 ** "These routes are protected by both authentication (protect middleware) and
 * authorization (restrictTo ADMIN). Only admins can view all users and manage
 * account statuses. This demonstrates proper RBAC implementation for sensitive
 * administrative operations."
 */

import { Router } from 'express';
import UserController from '@/controllers/user.controller';
import { protect } from '@/middleware/auth.middleware';
import { restrictTo } from '@/middleware/rbac.middleware';
import { UserRole } from '@/types';

const router = Router();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (Admin dashboard)
 * @access  Private (ADMIN only)
 * @header  Authorization: Bearer <access_token>
 * 
 * Response: { success, users: [...], total }
 ** "This endpoint powers the admin user management dashboard. It returns all users
 * with their status (active/banned), allowing admins to moderate the platform.
 * The RBAC middleware ensures only admins can access this sensitive data."
 */
router.get(
  '/',
  protect, // Step 1: Verify JWT
  restrictTo(UserRole.ADMIN), // Step 2: Check ADMIN role
  UserController.getAllUsers // Step 3: Fetch all users
);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Update user status (Ban/Unban)
 * @access  Private (ADMIN only)
 * @header  Authorization: Bearer <access_token>
 * @body    { isActive: boolean }
 * 
 * Response: { success, user }
 * 
 * Security Features:
 * - Admins cannot ban themselves
 * - Admins cannot ban other admins
 * - Banned users cannot login (checked in auth.controller.ts)
 ** "This implements a soft delete pattern for user management. When an admin bans
 * a user, we set isActive=false rather than deleting the record. This preserves
 * data integrity and audit trails. The login controller checks this flag before
 * issuing tokens, preventing banned users from accessing the system."
 */
router.patch(
  '/:id/status',
  protect, // Step 1: Verify JWT
  restrictTo(UserRole.ADMIN), // Step 2: Check ADMIN role
  UserController.updateUserStatus // Step 3: Toggle user status
);

export default router;
