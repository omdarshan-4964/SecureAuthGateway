/**
 * USER PROFILE CARD
 * Shows user information with glowing role badge
 */

'use client';

import { motion } from 'framer-motion';
import { User, Mail, Shield, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';

const roleConfig = {
  USER: { 
    icon: User, 
    gradient: 'from-purple-500 to-blue-500',
    glow: 'shadow-purple-500/50',
    label: 'Standard User',
    description: 'Basic platform access'
  },
  MERCHANT: { 
    icon: Sparkles, 
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/50',
    label: 'Merchant Account',
    description: 'Payment processing enabled'
  },
  ADMIN: { 
    icon: Shield, 
    gradient: 'from-red-500 to-pink-500',
    glow: 'shadow-red-500/50',
    label: 'Administrator',
    description: 'Full system access'
  },
};

export function UserProfileCard() {
  const { user } = useAuth();

  if (!user) return null;

  const roleInfo = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.USER;
  const RoleIcon = roleInfo.icon;
  const initials = (user.username || user.email || 'U').substring(0, 2).toUpperCase();

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-slate-950/50 border-slate-800">
      {/* Header with Gradient */}
      <div className={`h-24 bg-gradient-to-r ${roleInfo.gradient} relative`}>
        <div className="absolute inset-0 bg-black/20" />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      </div>

      {/* Avatar */}
      <div className="px-6 -mt-12 relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <Avatar className={`h-24 w-24 border-4 border-slate-950 shadow-2xl ${roleInfo.glow}`}>
            <AvatarFallback className={`bg-gradient-to-br ${roleInfo.gradient} text-white text-2xl font-bold`}>
              {initials}
            </AvatarFallback>
          </Avatar>
        </motion.div>
      </div>

      {/* User Info */}
      <div className="p-6 pt-4 space-y-4">
        {/* Name and Role */}
        <div>
          <h3 className="text-2xl font-bold text-slate-200">{user.username || user.email?.split('@')[0] || 'User'}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`bg-gradient-to-r ${roleInfo.gradient} border-0 shadow-lg ${roleInfo.glow}`}>
              <RoleIcon className="h-3 w-3 mr-1" />
              {roleInfo.label}
            </Badge>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-slate-400">Verified</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{roleInfo.description}</p>
        </div>

        <Separator className="bg-slate-800" />

        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <Mail className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Email Address</p>
              <p className="text-slate-300 font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Account ID</p>
              <p className="text-slate-300 font-mono text-xs">{user.id.substring(0, 12)}...</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Member Since</p>
              <p className="text-slate-300 font-medium">December 2025</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <p className="text-lg font-bold text-primary">100%</p>
            <p className="text-xs text-slate-400">Secure</p>
          </div>
          <div className="text-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <p className="text-lg font-bold text-emerald-500">Active</p>
            <p className="text-xs text-slate-400">Status</p>
          </div>
          <div className="text-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <p className="text-lg font-bold text-accent">JWT</p>
            <p className="text-xs text-slate-400">Auth</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
