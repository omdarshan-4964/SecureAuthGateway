/** */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api-client';
import type { AxiosAPIError } from '@/lib/types';

// Validation schema matching backend requirements
const transactionSchema = z.object({
  amount: z
    .number({ message: 'Amount must be a number' })
    .min(1, 'Amount must be at least $1')
    .max(1000000, 'Amount cannot exceed $1,000,000'),  // Backend limit
});

type TransactionFormData = z.infer<typeof transactionSchema>;

type TransactionStatus = 'idle' | 'processing' | 'success' | 'denied' | 'error';

export function TransactionSimulator() {
  const { user } = useAuth();
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [transactionId, setTransactionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const onSubmit = async (data: TransactionFormData) => {
    setStatus('processing');
    setErrorMessage('');

    try {
      // Call type-safe API client with all required fields
      const result = await api.transactions.simulate({
        amount: data.amount,
        currency: 'USD',
        customerEmail: user?.email || 'customer@example.com',
      });

      setTransactionId(result.transactionId);
      setStatus('success');
      reset();

      // Auto-reset after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setTransactionId('');
      }, 3000);
    } catch (error: unknown) {
      const axiosError = error as AxiosAPIError;
      const statusCode = axiosError?.response?.status;
      const message = axiosError?.response?.data?.message || axiosError?.message || 'Transaction failed';
      
      // Handle different error types
      if (statusCode === 403) {
        setStatus('denied');
        setErrorMessage('Your account role does not have permission to process transactions');
      } else if (statusCode === 402) {
        setStatus('error');
        setErrorMessage('Transaction declined by payment gateway');
      } else if (statusCode === 400) {
        setStatus('error');
        setErrorMessage(message);
      } else {
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }

      // Auto-reset after 4 seconds
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 4000);
    }
  };

  const canAccessTerminal = user?.role === 'MERCHANT' || user?.role === 'ADMIN';

  return (
    <Card className="relative overflow-hidden backdrop-blur-xl bg-slate-950/50 border-slate-800">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">
                Merchant Terminal
              </h3>
              <p className="text-xs text-slate-400">
                RBAC-Protected Payment Processor
              </p>
            </div>
          </div>
          <Badge
            variant={canAccessTerminal ? 'default' : 'destructive'}
            className="gap-1"
          >
            {canAccessTerminal ? (
              <>
                <Zap className="h-3 w-3" />
                Authorized
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Restricted
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-300">
                  Transaction Amount
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('amount', { valueAsNumber: true })}
                    className="pl-9 bg-slate-900/50 border-slate-700 text-slate-200 focus:border-emerald-500"
                  />
                </div>
                {errors.amount && (
                  <p className="text-xs text-red-400">{errors.amount.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!canAccessTerminal}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20"
              >
                {canAccessTerminal ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process Payment
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Access Denied
                  </>
                )}
              </Button>

              {!canAccessTerminal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <p className="text-xs text-red-400 text-center">
                    ⚠️ This feature requires MERCHANT or ADMIN role
                  </p>
                </motion.div>
              )}
            </motion.form>
          )}

          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 flex flex-col items-center justify-center gap-4"
            >
              <div className="relative">
                <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-slate-200">
                  Processing Transaction
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Verifying payment details...
                </p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-12 flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="relative"
              >
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 0] }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl"
                />
              </motion.div>
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-emerald-400">
                  Transaction Approved!
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {transactionId}
                </p>
                <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                  Payment Processed
                </Badge>
              </div>
            </motion.div>
          )}

          {status === 'denied' && (
            <motion.div
              key="denied"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-12 flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <Lock className="h-16 w-16 text-red-500" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 0] }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-red-500/30 rounded-full blur-xl"
                />
              </motion.div>
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-red-400">
                  Access Denied
                </p>
                <p className="text-sm text-slate-400">
                  {errorMessage || 'Insufficient permissions (403 Forbidden)'}
                </p>
                <Badge variant="outline" className="border-red-500 text-red-400">
                  RBAC Protection Active
                </Badge>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-12 flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <XCircle className="h-16 w-16 text-orange-500" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 0] }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-orange-500/30 rounded-full blur-xl"
                />
              </motion.div>
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold text-orange-400">
                  Transaction Failed
                </p>
                <p className="text-sm text-slate-400">
                  {errorMessage || 'Please try again or contact support'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-10" />
    </Card>
  );
}
