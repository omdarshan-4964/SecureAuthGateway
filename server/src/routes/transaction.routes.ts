import { Router } from 'express';
import TransactionController from '@/controllers/transaction.controller';
import { protect } from '@/middleware/auth.middleware';
import { restrictTo } from '@/middleware/rbac.middleware';
import { UserRole } from '@/types';

/**
 * TRANSACTION ROUTES - Payment Processing Endpoints
 ** "These routes demonstrate RBAC with real database persistence. The middleware chain:
 * 1. protect() verifies the JWT
 * 2. restrictTo() checks if the user has MERCHANT or ADMIN role
 * 3. Controller executes and saves/fetches from MongoDB
 * 
 * Regular USERs get 403 Forbidden. This is the same security pattern used by
 * payment processors - only verified merchants can process transactions."
 */

const router = Router();

/**
 * @route   POST /api/v1/transaction/simulate
 * @desc    Process a payment transaction and save to database
 * @access  Private (MERCHANT, ADMIN only)
 * @header  Authorization: Bearer <access_token>
 * @body    { amount, currency, customerEmail, description }
 * 
 * Response: { success, transactionId, status, amount, fee, netAmount, createdAt }
 ** "This endpoint processes real payments with MongoDB persistence:
 * 1. Validates transaction details
 * 2. Simulates payment gateway (1s delay)
 * 3. Saves to database (COMPLETED or FAILED)
 * 4. Returns transaction result
 * 
 * The 90% success rate simulates real-world conditions. RBAC ensures ONLY
 * merchants can process payments - USERs receive 403 Forbidden."
 */
router.post(
  '/simulate',
  protect, // Step 1: Verify JWT
  restrictTo(UserRole.MERCHANT, UserRole.ADMIN), // Step 2: Check role
  TransactionController.simulate // Step 3: Process and save to DB
);

/**
 * @route   GET /api/v1/transaction/history
 * @desc    Get transaction history from database with RBAC filtering
 * @access  Private (MERCHANT, ADMIN only)
 * @header  Authorization: Bearer <access_token>
 * 
 * Response: { success, transactions[], stats }
 * 
 * RBAC Filtering:
 * - MERCHANT: Returns only their transactions (filtered by merchantId)
 * - ADMIN: Returns ALL transactions with merchant details populated
 * - USER: 403 Forbidden
 ** "This queries MongoDB with role-based filtering. Merchants see only their
 * transactions, admins have full visibility. Critical for multi-tenant security."
 */
router.get(
  '/history',
  protect,
  restrictTo(UserRole.MERCHANT, UserRole.ADMIN),
  TransactionController.getHistory // Fetches from MongoDB with RBAC
);

export default router;
