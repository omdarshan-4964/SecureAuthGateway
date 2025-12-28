/**
 * DASHBOARD SIDEBAR
 * Neo-Fintech navigation with user profile
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  CreditCard, 
  Settings, 
  LogOut, 
  Shield, 
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import { useLogout } from '@/lib/auth-hooks';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Users', href: '/dashboard/users', icon: Users, adminOnly: true },
];

const roleConfig = {
  USER: { icon: User, color: 'bg-purple-500', gradient: 'from-purple-500 to-blue-500' },
  MERCHANT: { icon: Sparkles, color: 'bg-amber-500', gradient: 'from-amber-500 to-orange-500' },
  ADMIN: { icon: Shield, color: 'bg-red-500', gradient: 'from-red-500 to-pink-500' },
};

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    toast.success('Logged out successfully');
  };

  if (!user) return null;

  const roleInfo = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.USER;
  const RoleIcon = roleInfo.icon;
  const initials = (user.username || user.email || 'U').substring(0, 2).toUpperCase();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`fixed left-0 top-0 h-screen backdrop-blur-xl bg-slate-950/50 border-r border-slate-800 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-slate-200">
              SecureAuth
            </span>
          </motion.div>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 text-slate-400 hover:text-slate-200"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          // Hide admin-only items for non-admins
          if (item.adminOnly && user.role !== 'ADMIN') {
            return null;
          }

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-slate-800" />

      {/* User Profile */}
      <div className="p-4 space-y-3">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-slate-700">
              <AvatarFallback className={`bg-gradient-to-br ${roleInfo.gradient} text-white font-semibold`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ${roleInfo.color} border-2 border-slate-950 flex items-center justify-center`}>
              <RoleIcon className="h-2.5 w-2.5 text-white" />
            </div>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user.username}
              </p>
              <Badge variant="outline" className={`text-xs border-${roleInfo.color} mt-1`}>
                {user.role}
              </Badge>
            </div>
          )}
        </div>

        {!collapsed && (
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        )}

        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.aside>
  );
}
