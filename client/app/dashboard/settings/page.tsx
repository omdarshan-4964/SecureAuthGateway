/**
 * SETTINGS PAGE - Neo-Fintech User Management
 * Profile, security, and account management
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

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

export default function SettingsPage() {
  const { user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    // Mock password change (implement backend API call here)
    toast.success('Password Changed', {
      description: 'Your password has been updated successfully.',
    });

    // Reset form
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleDeleteAccount = () => {
    // Mock delete (implement confirmation modal + backend API)
    toast.error('Account Deletion', {
      description: 'This feature requires additional confirmation.',
    });
  };

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
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Account Settings</h1>
            <p className="text-slate-400 text-sm">
              Manage your profile and security preferences
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl space-y-6"
      >
        {/* Profile Section */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <User className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
              <p className="text-slate-400 text-sm">Your account details are managed securely</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <Label className="text-slate-300 mb-2">Username</Label>
              <Input
                value={user?.username || 'N/A'}
                disabled
                className="bg-slate-950/50 border-white/10 text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <Label className="text-slate-300 mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                value={user?.email || 'N/A'}
                disabled
                className="bg-slate-950/50 border-white/10 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">
                Email changes require verification. Contact support to update.
              </p>
            </div>

            {/* Role */}
            <div>
              <Label className="text-slate-300 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Account Role
              </Label>
              <div className="mt-2">
                <Badge className={`${getRoleColor(user?.role || 'USER')} text-sm px-3 py-1`}>
                  {user?.role || 'USER'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Your role determines access permissions across the platform.
              </p>
            </div>

            {/* Account ID */}
            <div>
              <Label className="text-slate-300 mb-2">Account ID</Label>
              <Input
                value={user?.id || 'N/A'}
                disabled
                className="bg-slate-950/50 border-white/10 text-slate-400 cursor-not-allowed font-mono text-xs"
              />
            </div>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Lock className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Security</h2>
              <p className="text-slate-400 text-sm">Update your password and security settings</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <Label className="text-slate-300 mb-2">Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="bg-slate-950/50 border-white/10 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <Label className="text-slate-300 mb-2">New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="Enter new password"
                  className="bg-slate-950/50 border-white/10 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label className="text-slate-300 mb-2">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm new password"
                  className="bg-slate-950/50 border-white/10 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Update Password
            </Button>
          </form>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          variants={itemVariants}
          className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
              <p className="text-red-300/70 text-sm">Irreversible account actions</p>
            </div>
          </div>

          <Separator className="bg-red-500/20 my-4" />

          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-1">Delete Account</h3>
              <p className="text-red-300/70 text-sm mb-3">
                Once you delete your account, there is no going back. This action is permanent
                and will remove all your data from our servers.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Background Effects */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}
