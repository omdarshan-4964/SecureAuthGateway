/**
 * REGISTER PAGE - Premium Fintech Aesthetic
 * Split-screen layout with role selection and enhanced validation
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Shield, ArrowRight, Mail, Lock, User, Chrome, Sparkles } from 'lucide-react';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useRegister } from '@/lib/auth-hooks';

// Zod Schema for Registration
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be less than 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['USER', 'MERCHANT', 'ADMIN']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const roles = [
  {
    value: 'USER' as const,
    label: 'User',
    description: 'Basic access to the platform',
    icon: User,
  },
  {
    value: 'MERCHANT' as const,
    label: 'Merchant',
    description: 'Process transactions and manage payments',
    icon: Sparkles,
  },
  {
    value: 'ADMIN' as const,
    label: 'Admin',
    description: 'Full system access and management',
    icon: Shield,
  },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'USER' | 'MERCHANT' | 'ADMIN'>('USER');
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test@1234',
      confirmPassword: 'Test@1234',
      role: 'USER',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(data);
      toast.success('Account Created Successfully!', {
        description: 'Please login with your credentials.',
        duration: 4000,
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      
      const errorMessage =
        axiosError?.response?.data?.error || 
        axiosError?.response?.data?.message ||
        (error as Error)?.message || 
        'Registration failed. Please try again.';
      
      toast.error('Registration Failed', {
        description: errorMessage,
      });
    }
  };

  const handleRoleSelect = (role: 'USER' | 'MERCHANT' | 'ADMIN') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - Marketing with Animated Gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative mesh-gradient overflow-hidden"
      >
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 grid-pattern opacity-20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo/Brand */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-bold">SecureAuth</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-6 mb-12"
          >
            <h1 className="text-5xl font-bold leading-tight">
              Join 10,000+ Developers
              <br />
              <span className="text-primary">Building Secure Apps</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-md">
              Get started with enterprise-grade authentication in minutes.
              No credit card required.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 mb-12"
          >
            {[
              { label: 'Uptime', value: '99.9%' },
              { label: 'API Calls/sec', value: '50K+' },
              { label: 'Zero DB', value: 'Lookups' },
            ].map((stat, i) => (
              <Card
                key={i}
                className="glass-form p-4 border-primary/20 text-center"
              >
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </Card>
            ))}
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="space-y-4"
          >
            {[
              'Stateless JWT authentication',
              'Role-based access control (RBAC)',
              'Auto token refresh & rotation',
              'OAuth 2.0 integration ready',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT SIDE - Register Form */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950 overflow-y-auto"
      >
        <div className="w-full max-w-md space-y-8 py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">SecureAuth</span>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
            <p className="text-muted-foreground">
              Get started with your free account today
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative glow-on-focus rounded-lg">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative glow-on-focus rounded-lg">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative glow-on-focus rounded-lg">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-12 h-12 bg-slate-900/50 border-slate-800 focus:border-primary"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative glow-on-focus rounded-lg">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Your Role</Label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleSelect(role.value)}
                      className={`
                        relative p-4 rounded-lg border-2 transition-all duration-200
                        ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {role.label}
                        </span>
                      </div>
                      {isSelected && (
                        <Badge className="absolute -top-2 -right-2 bg-primary text-xs">
                          Selected
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {roles.find((r) => r.value === selectedRole)?.description}
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || registerMutation.isPending}
              className="w-full h-12 btn-glow text-base font-semibold"
            >
              {isSubmitting || registerMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <Separator className="bg-slate-800" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 px-4 text-sm text-muted-foreground">
              Or continue with
            </span>
          </div>

          {/* Social Login (UI Only) */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-slate-800 hover:bg-slate-900/50"
            disabled
          >
            <Chrome className="w-5 h-5 mr-2" />
            Google (Coming Soon)
          </Button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
