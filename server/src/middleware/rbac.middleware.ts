import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '@/types';
import { AppError } from './errorHandler';

/**
 * ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 ** "I implemented RBAC using a higher-order function that returns middleware.
 * This allows flexible role checking: restrictTo(UserRole.ADMIN) or restrictTo(UserRole.MERCHANT, UserRole.ADMIN).
 * The role is encoded in the JWT, so this check is stateless - no database query needed.
 * This is the same pattern used by AWS IAM and enterprise authorization systems."
 */

/**
 * RESTRICT TO SPECIFIC ROLES
 * 
 * Purpose: Ensure user has required role(s) to access a route
 * Usage: Apply AFTER the protect middleware
 * 
 * Flow:
 * 1. Check if req.user exists (protect middleware must have run first)
 * 2. Check if user's role is in the allowed list
 * 3. If not, return 403 Forbidden
 * 4. If yes, continue to next middleware
 * 
 * Example Usage:
 * router.post('/transaction/simulate', 
 *   protect, 
 *   restrictTo(UserRole.MERCHANT, UserRole.ADMIN),
 *   simulateTransaction
 * );
 ** "This implements the principle of least privilege - users only get access to what they need.
 * The role hierarchy is USER < MERCHANT < ADMIN. In a real system, we might implement
 * hierarchical roles where ADMIN inherits MERCHANT permissions, but for clarity I keep them explicit."
 */
export const restrictTo = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      // 1. CHECK IF USER IS AUTHENTICATED
      // This should never fail if protect() middleware ran first
      if (!req.user) {
        throw new AppError(
          'Authentication required. Please log in first.',
          401
        );
      }

      // 2. CHECK IF USER'S ROLE IS ALLOWED
      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(
          `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}`,
          403
        );
      }

      // 3. USER HAS REQUIRED ROLE - PROCEED
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * REQUIRE ADMIN MIDDLEWARE
 * 
 * Purpose: Shorthand for restricting to Admin only
 * Usage: Apply AFTER the protect middleware
 * 
 * Example:
 * router.delete('/admin/users/:id', protect, requireAdmin, deleteUser);
 */
export const requireAdmin = restrictTo(UserRole.ADMIN);

/**
 * REQUIRE MERCHANT OR ADMIN MIDDLEWARE
 * 
 * Purpose: Shorthand for business-level operations
 * Usage: Apply AFTER the protect middleware
 * 
 * Example:
 * router.post('/transaction/process', protect, requireMerchant, processPayment);
 */
export const requireMerchant = restrictTo(UserRole.MERCHANT, UserRole.ADMIN);

/**
 * CHECK OWNERSHIP MIDDLEWARE
 * 
 * Purpose: Ensure user can only access their own resources
 * Usage: For routes like /users/:userId where users should only access their own data
 ** "This implements resource-level authorization. Even if a user is authenticated,
 * they shouldn't be able to access other users' data. This middleware checks that
 * the requested resource belongs to the authenticated user, unless they're an admin."
 * 
 * Example:
 * router.get('/users/:userId/profile', protect, checkOwnership, getProfile);
 */
export const checkOwnership = (resourceParam: string = 'userId') => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      // 1. CHECK IF USER IS AUTHENTICATED
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // 2. ADMINS CAN ACCESS ANY RESOURCE
      if (req.user.role === UserRole.ADMIN) {
        return next();
      }

      // 3. EXTRACT RESOURCE ID FROM PARAMS
      const resourceId = req.params[resourceParam];

      if (!resourceId) {
        throw new AppError(
          `Resource identifier '${resourceParam}' not found in request`,
          400
        );
      }

      // 4. CHECK IF USER OWNS THE RESOURCE
      if (req.user.userId !== resourceId) {
        throw new AppError(
          'Access denied. You can only access your own resources.',
          403
        );
      }

      // 5. USER OWNS THE RESOURCE - PROCEED
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * ROLE HIERARCHY CHECK (OPTIONAL - FOR ADVANCED RBAC)
 * 
 * Purpose: Check if user's role is at least the required level
 * Usage: When you want hierarchical permissions (Admin > Merchant > User)
 * 
 * This is commented out for now but shows how you could implement hierarchical RBAC
 */
/*
const roleHierarchy = {
  [UserRole.USER]: 1,
  [UserRole.MERCHANT]: 2,
  [UserRole.ADMIN]: 3,
};

export const requireRoleLevel = (minimumRole: UserRole) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const userLevel = roleHierarchy[req.user.role];
    const requiredLevel = roleHierarchy[minimumRole];

    if (userLevel < requiredLevel) {
      throw new AppError(
        `Access denied. Minimum role required: ${minimumRole}`,
        403
      );
    }

    next();
  };
};
*/
