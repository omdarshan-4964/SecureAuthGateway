/**
 * REQUIRE AUTH WRAPPER
 * Protects routes and shows loading state
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="relative">
          {/* Animated glass spinner */}
          <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-accent/20 blur-3xl animate-pulse" />
          <div className="relative backdrop-blur-xl bg-slate-950/50 border border-slate-800 rounded-2xl p-12 shadow-2xl">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-slate-200">
                  Authenticating
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Verifying your credentials...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
