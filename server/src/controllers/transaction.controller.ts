import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types';
import { AppError, asyncHandler } from '@/middleware/errorHandler';
import { sendSuccess } from '@/utils/response';
import Transaction from '@/models/Transaction';

/**
 * TRANSACTION CONTROLLER - Real Database Persistence
 ** "This controller demonstrates real payment processing with MongoDB persistence.
 * It validates transactions, simulates payment gateway processing (1s delay),
 * and stores results in the database. The RBAC system ensures only MERCHANT and
 * ADMIN roles can process payments, with data filtering based on user permissions."
 */

class TransactionController {
  /**
   * SIMULATE TRANSACTION
   * 
   * POST /api/v1/transaction/simulate
   * Headers: Authorization: Bearer <access_token>
   * Body: { amount, currency, customerEmail, description }
   * 
   * Access: MERCHANT and ADMIN only (enforced by RBAC middleware)
   * 
   * Flow:
   * 1. Validate input (amount, currency, email)
   * 2. Simulate network delay (mock bank API call - 1 second)
   * 3. Randomly determine success/failure (90% success rate)
   * 4. Save transaction to MongoDB
   * 5. Return transaction result
   */
  public static simulate = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
      _next: NextFunction
    ): Promise<void> => {
      const { amount, currency, customerEmail, description } = req.body;

      // 1. VALIDATE INPUT
      if (!amount || !currency || !customerEmail) {
        throw new AppError(
          'Please provide amount, currency, and customerEmail',
          400
        );
      }

      if (typeof amount !== 'number' || amount <= 0) {
        throw new AppError('Amount must be a positive number', 400);
      }

      if (amount > 1000000) {
        throw new AppError(
          'Amount exceeds maximum transaction limit of 1,000,000',
          400
        );
      }

      // Simple email validation
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(customerEmail)) {
        throw new AppError('Invalid customer email address', 400);
      }

      // Validate currency code (ISO 4217)
      const validCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];
      if (!validCurrencies.includes(currency.toUpperCase())) {
        throw new AppError(
          `Invalid currency. Supported: ${validCurrencies.join(', ')}`,
          400
        );
      }

      // 2. SIMULATE NETWORK DELAY (Mock Bank API Call)
      // In production, this would be an actual API call to Razorpay/Stripe/etc.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. RANDOMLY DETERMINE SUCCESS/FAILURE (90% success rate)
      const isSuccess = Math.random() < 0.9;
      const status = isSuccess ? 'COMPLETED' : 'FAILED';

      if (!isSuccess) {
        // Save failed transaction to database
        const failedTransaction = await Transaction.create({
          merchantId: req.user?.userId,
          amount,
          currency: currency.toUpperCase(),
          status: 'FAILED',
          customerEmail,
          description: description || 'Payment attempt failed',
        });

        // Return failure response
        throw new AppError(
          'Transaction declined by payment gateway. Please try again or use a different payment method.',
          402 // Payment Required status code
        );
      }

      // 4. SAVE SUCCESSFUL TRANSACTION TO DATABASE
      const transaction = await Transaction.create({
        merchantId: req.user?.userId,
        amount,
        currency: currency.toUpperCase(),
        status: 'COMPLETED',
        customerEmail,
        description: description || 'Payment processed successfully',
      });

      // 5. RETURN TRANSACTION DATA
      const transactionData = {
        transactionId: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        customerEmail: transaction.customerEmail,
        description: transaction.description,
        merchantId: req.user?.userId,
        createdAt: transaction.createdAt,
        processingTime: '1000ms', // Simulated
        fee: (amount * 0.029 + 0.3).toFixed(2), // Typical payment processor fee (2.9% + $0.30)
        netAmount: (amount - (amount * 0.029 + 0.3)).toFixed(2),
      };

      sendSuccess(
        res,
        'Transaction processed successfully',
        transactionData,
        201
      );
    }
  );

  /**
   * GET TRANSACTION HISTORY (Bonus Endpoint)
   * 
   * GET /api/v1/transaction/history
   * 
   * In a real system, this would query the database for past transactions
   * filtered by the merchant's ID. For now, it's just a placeholder.
   */
  public static getTransactionHistory = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
      _next: NextFunction
    ): Promise<void> => {
      // Mock transaction history
      const mockHistory = [
        {
          transactionId: 'TXN_1703424000000_A1B2C3D4',
          status: 'COMPLETED',
          amount: 150.00,
          currency: 'USD',
          customerEmail: 'customer1@example.com',
          timestamp: '2025-12-20T10:30:00.000Z',
        },
        {
          transactionId: 'TXN_1703424100000_E5F6G7H8',
          status: 'COMPLETED',
          amount: 299.99,
          currency: 'USD',
          customerEmail: 'customer2@example.com',
          timestamp: '2025-12-21T14:15:00.000Z',
        },
        {
          transactionId: 'TXN_1703424200000_I9J0K1L2',
          status: 'FAILED',
          amount: 500.00,
          currency: 'EUR',
          customerEmail: 'customer3@example.com',
          timestamp: '2025-12-22T09:45:00.000Z',
        },
      ];

      sendSuccess(res, 'Transaction history retrieved successfully', {
        merchantId: req.user?.userId,
        totalTransactions: mockHistory.length,
        transactions: mockHistory,
      });
    }
  );

  /**
   * GET TRANSACTION ANALYTICS (Bonus Endpoint)
   * 
   * GET /api/v1/transaction/analytics
   * 
   * Mock analytics dashboard data for the frontend
   */
  public static getAnalytics = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
      _next: NextFunction
    ): Promise<void> => {
      // Mock analytics data
      const analytics = {
        merchantId: req.user?.userId,
        period: 'Last 30 Days',
        totalVolume: 15750.50,
        totalTransactions: 47,
        successRate: 0.936, // 93.6%
        averageTransactionValue: 335.12,
        topCurrency: 'USD',
        peakHour: '14:00 - 15:00 UTC',
        dailyVolume: [
          { date: '2025-12-01', volume: 450.00, count: 3 },
          { date: '2025-12-02', volume: 780.50, count: 5 },
          { date: '2025-12-03', volume: 320.00, count: 2 },
          // ... more days
        ],
      };

      sendSuccess(res, 'Analytics retrieved successfully', analytics);
    }
  );

  /**
   * GET TRANSACTION HISTORY
   * 
   * GET /api/v1/transaction/history
   * Headers: Authorization: Bearer <access_token>
   * 
   * Access Control (RBAC):
   * - USER: 403 Forbidden (users don't process transactions)
   * - MERCHANT: Returns only their transactions (filtered by merchantId)
   * - ADMIN: Returns all transactions with merchant details populated
   ** "This endpoint demonstrates role-based data filtering from MongoDB.
   * Merchants see only their transactions, while admins have full visibility.
   * This is crucial for multi-tenant systems where data isolation is required."
   */
  public static getHistory = asyncHandler(
    async (
      req: AuthenticatedRequest,
      res: Response,
      _next: NextFunction
    ): Promise<void> => {
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      // 1. USERS CAN'T ACCESS TRANSACTION HISTORY
      if (userRole === 'USER') {
        throw new AppError(
          'Access denied. Users do not have transaction privileges.',
          403
        );
      }

      // 2. FETCH TRANSACTIONS FROM DATABASE BASED ON ROLE
      let transactions;

      if (userRole === 'ADMIN') {
        // ADMIN: Fetch ALL transactions with merchant details
        transactions = await Transaction.find()
          .populate('merchantId', 'username email')
          .sort({ createdAt: -1 })
          .lean();
      } else {
        // MERCHANT: Fetch ONLY their transactions
        transactions = await Transaction.find({ merchantId: userId })
          .sort({ createdAt: -1 })
          .lean();
      }

      // 3. CALCULATE STATS
      const totalVolume = transactions.reduce((sum, t) => 
        t.status === 'COMPLETED' ? sum + t.amount : sum, 0
      );
      const successCount = transactions.filter(t => t.status === 'COMPLETED').length;
      const successRate = transactions.length > 0 
        ? (successCount / transactions.length * 100).toFixed(1)
        : '0';

      // 4. FORMAT RESPONSE
      const formattedTransactions = transactions.map((t: any) => ({
        id: t.id || t._id,
        merchantId: t.merchantId?._id || t.merchantId,
        merchantUsername: t.merchantId?.username || 'N/A',
        merchantEmail: t.merchantId?.email || 'N/A',
        amount: t.amount,
        currency: t.currency,
        status: t.status.toLowerCase(),
        customerEmail: t.customerEmail,
        description: t.description,
        createdAt: t.createdAt,
      }));

      sendSuccess(res, 'Transaction history retrieved successfully', {
        transactions: formattedTransactions,
        stats: {
          totalVolume: totalVolume.toFixed(2),
          totalCount: transactions.length,
          successCount,
          successRate: `${successRate}%`,
        },
      });
    }
  );
}

export default TransactionController;
