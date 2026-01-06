/**
 * LOGIN PAGE - Premium Fintech Aesthetic
 * Split-screen layout with animated gradient and glass-effect form
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Shield, ArrowRight, Mail, Lock, Chrome } from 'lucide-react';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLogin } from '@/lib/auth-hooks';
import { fadeInUp, crossFade, scaleOnHover } from '@/lib/animations';

// Zod Schema for Login Validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'test@example.com',
      password: 'Test@1234',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    let loadingToast: string | number | undefined;
    
    try {
      // Show loading notification
      loadingToast = toast.loading('Authenticating...', {
        description: 'Verifying your credentials',
      });
      
      await loginMutation.mutateAsync(data);
      
      // Dismiss loading and show success
      toast.dismiss(loadingToast);
      toast.success('Welcome Back!', {
        description: 'Login successful. Redirecting to dashboard...',
        duration: 2000,
      });
    } catch (error: unknown) {
      // CRITICAL: Dismiss loading toast on error
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      
      const errorMessage =
        axiosError?.response?.data?.error ||
        axiosError?.response?.data?.message ||
        (error as Error)?.message ||
        'Login failed. Please check your credentials.';
      
      toast.error('Login Failed', {
        description: errorMessage,
      });
    }
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
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 dot-pattern opacity-30" />

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
              Bank-Grade Security
              <br />
              <span className="text-primary">for Modern Apps</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-md">
              Enterprise authentication infrastructure trusted by fintech leaders.
              JWT, RBAC, and OAuth 2.0 built-in.
            </p>
          </motion.div>

          {/* Code Snippet Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="float-animation"
          >
            <Card className="glass-form p-6 max-w-md border-primary/20">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 font-mono">auth.service.ts</span>
                </div>
                <pre className="text-sm text-slate-300 font-mono">
                  <code>{`// Stateless JWT Auth
const token = jwt.sign({
  userId: user.id,
  role: user.role
}, JWT_SECRET, {
  expiresIn: '15m'
});

// 99.9% Uptime ✓
// Zero DB Lookups ✓`}</code>
                </pre>
              </div>
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 flex gap-8"
          >
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>15min Access Tokens</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>Auto Token Refresh</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-2 h-2 rounded-full bg-chart-3" />
              <span>RBAC Enabled</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT SIDE - Login Form */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950"
      >
        <motion.div
          variants={crossFade}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">SecureAuth</span>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          {/* Submit Button */}
          <motion.div whileHover={scaleOnHover} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="w-full h-12 btn-glow text-base font-semibold"
            >
              {isSubmitting || loginMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
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

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Create one now
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}