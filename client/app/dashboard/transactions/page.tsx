/**
 * TRANSACTIONS PAGE - Neo-Fintech History View
 * Real-time transaction history with glass-morphism design
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  Search,
  DollarSign,
  Activity,
  Clock,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  status: 'completed' | 'failed';
  createdAt: string;
  description: string;
}

interface TransactionStats {
  totalVolume: string;
  totalCount: number;
  successCount: number;
  successRate: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(
        'http://localhost:5000/api/v1/transaction/history',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data.data;
      setTransactions(data.transactions);
      setStats(data.stats);
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosError.response?.status === 403) {
        setError('Access denied. Only merchants and admins can view transactions.');
      } else {
        setError(axiosError.response?.data?.message || 'Failed to fetch transactions');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading transactions...</p>
        </div>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Transaction History
              </h1>
              <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                <Activity className="h-4 w-4" />
                {user?.role === 'ADMIN' ? 'All Transactions' : 'Your Transactions'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/5"
            onClick={fetchTransactions}
          >
            <Download className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center"
        >
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Access Denied</h3>
          <p className="text-red-300/70">{error}</p>
        </motion.div>
      ) : (
        <>
          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            {/* Total Volume */}
            <motion.div
              variants={itemVariants}
              className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-8 w-8 text-emerald-400" />
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-slate-400 text-sm">Total Volume</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${stats?.totalVolume || '0.00'}
              </p>
            </motion.div>

            {/* Total Count */}
            <motion.div
              variants={itemVariants}
              className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8 text-violet-400" />
              </div>
              <p className="text-slate-400 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.totalCount || 0}
              </p>
            </motion.div>

            {/* Success Count */}
            <motion.div
              variants={itemVariants}
              className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-slate-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.successCount || 0}
              </p>
            </motion.div>

            {/* Success Rate */}
            <motion.div
              variants={itemVariants}
              className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-amber-400" />
              </div>
              <p className="text-slate-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.successRate || '0%'}
              </p>
            </motion.div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search by transaction ID or customer email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </motion.div>

          {/* Transactions Table */}
          {filteredTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center"
            >
              <CreditCard className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                No Transactions Found
              </h3>
              <p className="text-slate-500">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Start processing payments to see your transaction history'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-950/50 border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-400">
                        Transaction ID
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-400">
                        Customer
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-400">
                        Amount
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-400">
                        Status
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-400">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <span className="text-slate-300 font-mono text-sm">
                            {transaction.id.substring(0, 20)}...
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-300 text-sm">
                            {transaction.customerEmail}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-white font-semibold">
                            {transaction.amount.toFixed(2)} {transaction.currency}
                          </span>
                        </td>
                        <td className="p-4">
                          {transaction.status === 'completed' ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Clock className="h-4 w-4" />
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Background Effects */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}
