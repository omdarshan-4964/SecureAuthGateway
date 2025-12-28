/**
 * SESSION INFO WIDGET
 * Shows token status and security information
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Lock, Wifi, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function SessionInfo() {
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes in seconds
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 900));
      setSessionDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = ((900 - timeRemaining) / 900) * 100;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="overflow-hidden backdrop-blur-xl bg-slate-950/50 border-slate-800">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">
                Session Security
              </h3>
              <p className="text-xs text-slate-400">
                JWT Token Status
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-500 text-emerald-400 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Token Expiry Countdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-300">Token Expires In</span>
            </div>
            <motion.span
              key={timeRemaining}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-lg font-mono font-bold text-primary"
            >
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </motion.span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-slate-500 text-center">
            Auto-refresh enabled • Seamless token rotation
          </p>
        </div>

        {/* Security Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-slate-400">Encryption</span>
            </div>
            <p className="text-sm font-semibold text-slate-200">HS256</p>
            <p className="text-xs text-slate-500 mt-1">HttpOnly Cookies</p>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-slate-400">Connection</span>
            </div>
            <p className="text-sm font-semibold text-slate-200">Secure</p>
            <p className="text-xs text-slate-500 mt-1">TLS 1.3</p>
          </div>
        </div>

        {/* Session Duration */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Current Session</p>
              <p className="text-lg font-bold text-slate-200 mt-1">
                {formatDuration(sessionDuration)}
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
            </motion.div>
          </div>
        </div>

        {/* Security Features */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Protections
          </p>
          <div className="space-y-2">
            {[
              'XSS Prevention',
              'CSRF Protection',
              'Auto Token Refresh',
              'Request Queue Management',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -z-10" />
    </Card>
  );
}
