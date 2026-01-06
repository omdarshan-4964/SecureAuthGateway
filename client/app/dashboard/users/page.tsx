/**
 * USERS MANAGEMENT PAGE - Admin Dashboard
 * View and manage all users (Ban/Unban functionality)
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users as UsersIcon,
  Shield,
  ShieldOff,
  Mail,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'MERCHANT' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
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

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/users');
      setUsers(response.data.data.users);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      setError(errorMessage);
      toast.error('Error', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'unban' : 'ban';

    // Optimistic UI update
    setUpdatingUserId(userId);
    const previousUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, isActive: newStatus } : u));

    try {
      await axiosInstance.patch(
        `/users/${userId}/status`,
        { isActive: newStatus }
      );

      toast.success(
        newStatus ? 'User Activated' : 'User Banned',
        {
          description: `Successfully ${action}ned the user.`,
        }
      );
    } catch (err) {
      // Revert optimistic update on error
      setUsers(previousUsers);
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || `Failed to ${action} user`;
      toast.error('Error', { description: errorMessage });
    } finally {
      setUpdatingUserId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Check if user is admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 max-w-md text-center"
        >
          <ShieldOff className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-red-300/70">
            Only administrators can access the user management dashboard.
          </p>
        </motion.div>
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
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="text-slate-400 text-sm">
                View and manage all registered users
              </p>
            </div>
          </div>
          <Button
            onClick={fetchUsers}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UsersIcon className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
          <span className="ml-3 text-slate-400">Loading users...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-xl p-6 mb-6"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div>
              <h3 className="text-red-400 font-semibold">Error Loading Users</h3>
              <p className="text-red-300/70 text-sm">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Stats Header */}
          <div className="bg-slate-950/50 p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <div className="h-12 w-px bg-white/10" />
                <div>
                  <p className="text-slate-400 text-sm">Active</p>
                  <p className="text-xl font-bold text-emerald-400">
                    {users.filter(u => u.isActive).length}
                  </p>
                </div>
                <div className="h-12 w-px bg-white/10" />
                <div>
                  <p className="text-slate-400 text-sm">Banned</p>
                  <p className="text-xl font-bold text-red-400">
                    {users.filter(u => !u.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-950/50 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-slate-400 font-semibold text-sm">
                    User
                  </th>
                  <th className="text-left p-4 text-slate-400 font-semibold text-sm">
                    Email
                  </th>
                  <th className="text-left p-4 text-slate-400 font-semibold text-sm">
                    Role
                  </th>
                  <th className="text-left p-4 text-slate-400 font-semibold text-sm">
                    Status
                  </th>
                  <th className="text-left p-4 text-slate-400 font-semibold text-sm">
                    Joined
                  </th>
                  <th className="text-center p-4 text-slate-400 font-semibold text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <motion.tr
                    key={u.id}
                    variants={itemVariants}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    {/* User */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{u.username}</p>
                          <p className="text-slate-500 text-xs">ID: {u.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-300 text-sm">{u.email}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <Badge className={`${getRoleColor(u.role)} text-sm px-3 py-1`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {u.role}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {u.isActive ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-sm px-3 py-1">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-sm px-3 py-1">
                          <XCircle className="h-3 w-3 mr-1" />
                          Banned
                        </Badge>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-400 text-sm">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex justify-center">
                        {u.role === 'ADMIN' ? (
                          <Badge className="bg-slate-800 text-slate-500 border-slate-700 text-xs">
                            Protected
                          </Badge>
                        ) : u.id === user?.id ? (
                          <Badge className="bg-slate-800 text-slate-500 border-slate-700 text-xs">
                            You
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => handleToggleStatus(u.id, u.isActive)}
                            disabled={updatingUserId === u.id}
                            className={`${
                              u.isActive
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                            } text-xs px-3 py-1 h-auto`}
                          >
                            {updatingUserId === u.id ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : u.isActive ? (
                              <ShieldOff className="h-3 w-3 mr-1" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            )}
                            {u.isActive ? 'Ban User' : 'Unban User'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {users.length === 0 && (
            <div className="p-12 text-center">
              <UsersIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No Users Found</h3>
              <p className="text-slate-500">There are no registered users in the system.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Background Effects */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}
