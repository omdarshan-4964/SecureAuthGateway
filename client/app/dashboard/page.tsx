/**
 * DASHBOARD PAGE - Neo-Fintech Command Center
 * Premium dashboard with RBAC-protected Merchant Terminal
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  User,
  Mail,
  Calendar,
  CreditCard,
  Lock,
  CheckCircle2,
  DollarSign,
  Activity,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-context';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    'idle' | 'success' | 'denied' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'USER':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'MERCHANT':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'ADMIN':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Handle transaction processing
  const handleTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setTransactionStatus('error');
      setErrorMessage('Please enter a valid amount');
      setTimeout(() => setTransactionStatus('idle'), 3000);
      return;
    }

    setIsProcessing(true);
    setTransactionStatus('idle');

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        setTransactionStatus('error');
        setErrorMessage('Invalid access token. Please login again.');
        setTimeout(() => setTransactionStatus('idle'), 3000);
        return;
      }
      
      await axios.post(
        'http://localhost:5000/api/v1/transaction/simulate',
        {
          amount: parseFloat(amount),
          currency: 'USD',
          customerEmail: user?.email || 'customer@example.com',
          merchantId: 'merchant_demo_001',
          description: 'Dashboard Payment Simulation',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Success - User is MERCHANT or ADMIN
      setTransactionStatus('success');
      setTimeout(() => {
        setTransactionStatus('idle');
        setAmount('');
      }, 3000);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      if (axiosError.response?.status === 403) {
        // Access Denied - User role detected
        setTransactionStatus('denied');
        setTimeout(() => {
          setTransactionStatus('idle');
        }, 3000);
      } else if (axiosError.response?.status === 401) {
        // Invalid token
        setTransactionStatus('error');
        setErrorMessage('Invalid access token. Please login again.');
        setTimeout(() => setTransactionStatus('idle'), 3000);
      } else {
        setTransactionStatus('error');
        setErrorMessage(axiosError.response?.data?.message || 'Transaction failed. Please try again.');
        setTimeout(() => setTransactionStatus('idle'), 3000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user.username}
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
              <Activity className="h-4 w-4" />
              Command Center Active
            </p>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* SECTION A: User Profile Card */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="relative bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-2xl" />
            
            <div className="relative z-10">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">
                    {user.username}
                  </h2>
                  <p className="text-slate-400 text-sm">Account Profile</p>
                </div>
              </div>

              {/* Role Badge - Large and Prominent */}
              <div className="mb-6">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getRoleColor(
                    user.role
                  )} font-semibold text-sm`}
                >
                  <Shield className="h-5 w-5" />
                  {user.role} ROLE
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">ID: {user.id?.slice(0, 12)}...</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">
                    Joined {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Account Status</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-sm font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SECTION B: Merchant Terminal (RBAC Test) */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="relative bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Merchant Terminal
                    </h2>
                    <p className="text-slate-400 text-sm">
                      RBAC-Protected Payment Processor
                    </p>
                  </div>
                </div>

                {/* Role Restriction Badge */}
                {user.role === 'USER' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Lock className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">
                      Restricted
                    </span>
                  </div>
                )}
              </div>

              {/* Terminal UI */}
              <div className="bg-slate-950/50 rounded-xl p-6 border border-white/5">
                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Transaction Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      disabled={isProcessing}
                      className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all disabled:opacity-50"
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    Enter amount in USD currency
                  </p>
                </div>

                {/* Process Button */}
                <button
                  onClick={handleTransaction}
                  disabled={isProcessing || !amount}
                  className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 shadow-lg shadow-violet-500/20 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Process Payment
                    </>
                  )}
                </button>

                {/* Transaction Status - Animated */}
                <AnimatePresence mode="wait">
                  {transactionStatus === 'denied' && (
                    <motion.div
                      key="denied"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <Lock className="h-8 w-8 text-red-400" />
                        </motion.div>
                        <div>
                          <h3 className="text-red-400 font-semibold">
                            Access Denied
                          </h3>
                          <p className="text-red-300/70 text-sm">
                            This feature requires MERCHANT or ADMIN role
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {transactionStatus === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                        >
                          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                        </motion.div>
                        <div>
                          <h3 className="text-emerald-400 font-semibold">
                            Payment Processed
                          </h3>
                          <p className="text-emerald-300/70 text-sm">
                            Transaction completed successfully
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {transactionStatus === 'error' && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, -5, 5, -5, 0] }}
                          transition={{ duration: 0.6, repeat: 2 }}
                        >
                          <Activity className="h-8 w-8 text-orange-400" />
                        </motion.div>
                        <div>
                          <h3 className="text-orange-400 font-semibold">
                            Transaction Error
                          </h3>
                          <p className="text-orange-300/70 text-sm">
                            {errorMessage}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-violet-500/5 border border-violet-500/20 rounded-lg">
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-violet-300 font-medium text-sm mb-1">
                        RBAC Protection Active
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        This terminal validates your JWT token and role permissions
                        before processing. USER roles will receive a 403 Forbidden
                        response.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Stat 1 */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Session Status</p>
                <p className="text-white text-xl font-bold mt-1">Active</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Authentication</p>
                <p className="text-white text-xl font-bold mt-1">JWT Active</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-violet-400" />
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Access Level</p>
                <p className="text-white text-xl font-bold mt-1">{user.role}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <User className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Background Effects */}
      <div className="fixed top-0 left-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}
