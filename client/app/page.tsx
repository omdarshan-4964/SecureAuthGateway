'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Zap, CheckCircle2, ArrowRight, Code2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-x-hidden">
      {/* Aurora Background Animation - Fixed */}
      <motion.div
        className="fixed inset-0 -z-10"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: `
            radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.12) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.12) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(139, 92, 246, 0.08) 0px, transparent 50%),
            rgb(2, 6, 23)
          `,
          backgroundSize: '200% 200%',
        }}
      />

      {/* Glass-morphism Navbar - Slide Down Animation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SecureAuth Gateway</span>
            </Link>

            {/* Right: CTA Button */}
            <div>
              {user ? (
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-slate-700 hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-400 transition-all duration-300"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="border-slate-700 hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-400 transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto"
        >
          {/* Badge - Fixed Wrapping */}
          <motion.div variants={fadeInUp} className="w-full flex justify-center">
            <Badge variant="outline" className="px-4 py-2 text-sm border-violet-500/30 bg-violet-500/10 whitespace-normal text-center max-w-2xl">
              <Zap className="w-4 h-4 mr-2 text-violet-400 flex-shrink-0" />
              <span>A Payment-Grade Authentication & Identity Infrastructure</span>
            </Badge>
          </motion.div>

          {/* Main Headline - Massive Typography */}
          <motion.h1
            variants={fadeInUp}
            className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.1]"
          >
            The Infrastructure of{' '}
            <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Digital Trust.
            </span>
          </motion.h1>

          {/* Sub-headline - Larger and More Readable */}
          <motion.p
            variants={fadeInUp}
            className="text-xl sm:text-2xl text-slate-400 max-w-2xl leading-relaxed"
          >
            Enterprise-grade authentication with JWT, RBAC, and MongoDB. Built for applications that demand 99.9% security.
          </motion.p>

          {/* CTA Buttons - Larger with Glow Effect */}
          <motion.div
            variants={fadeInUp}
            className="flex gap-6 flex-wrap justify-center mt-8"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/register">
                <Button
                  className="h-14 px-8 text-lg font-semibold shadow-2xl shadow-violet-500/50 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 relative overflow-hidden group"
                >
                  {/* Glow Effect Behind Button */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-500/50 to-purple-600/50 blur-xl -z-10"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  {/* Shine Effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Shield className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">Get Started</span>
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/login">
                <Button
                  className="h-14 px-8 text-lg font-semibold border-2 border-slate-700 hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-400 transition-all duration-300 bg-slate-900/50 backdrop-blur-sm"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature Cards - Bento Grid Style */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16"
          >
            <motion.div variants={fadeInUp} className="h-full">
              <Card className="h-full p-6 space-y-4 bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-violet-500/40 transition-all duration-300 relative overflow-hidden group">
                {/* Spotlight Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-violet-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-colors" />
                <div className="relative z-10">
                  {/* Larger Icon Container */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-violet-600/30 transition-all duration-300 shadow-lg shadow-violet-500/20">
                    <Shield className="w-10 h-10 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-6">Stateless JWT Auth</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Dual-token system with 15min access tokens and 7-day refresh tokens.
                    Zero database lookups for verification.
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="h-full">
              <Card className="h-full p-6 space-y-4 bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-amber-500/40 transition-all duration-300 relative overflow-hidden group">
                {/* Spotlight Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors" />
                <div className="relative z-10">
                  {/* Larger Icon Container */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center group-hover:from-amber-500/30 group-hover:to-amber-600/30 transition-all duration-300 shadow-lg shadow-amber-500/20">
                    <Lock className="w-10 h-10 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-6">Role-Based Access</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Granular RBAC with USER, MERCHANT, and ADMIN roles.
                    Fine-grained permission control per endpoint.
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} className="h-full">
              <Card className="h-full p-6 space-y-4 bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden group">
                {/* Spotlight Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
                <div className="relative z-10">
                  {/* Larger Icon Container */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-emerald-600/30 transition-all duration-300 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-6">Auto Token Refresh</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Seamless token rotation with request queue management.
                    Users never see authentication errors.
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Tech Stack - Polished */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-20 space-y-4"
          >
            <h2 className="text-xs uppercase tracking-widest text-slate-500 text-center font-medium">
              POWERED BY MODERN STACK
            </h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap gap-3 justify-center"
            >
              {["Next.js 15", "TypeScript", "Tailwind CSS", "Node.js", "Express", "MongoDB", "JWT", "Bcrypt"].map((tech) => (
                <motion.div key={tech} variants={fadeInUp}>
                  <Badge className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-violet-500/30 transition-all duration-300 rounded-full">
                    {tech}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* Developer Experience Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Side - Text Content */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                <Code2 className="w-6 h-6 text-violet-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Developer Experience
              </h2>
            </div>
            <p className="text-xl text-slate-400 leading-relaxed">
              Integrate in minutes, not months. Our SDK is designed for developers who value simplicity and speed.
            </p>
            <ul className="space-y-3">
              {[
                "Type-safe TypeScript APIs",
                "Comprehensive documentation",
                "Zero-configuration setup",
                "Built-in error handling",
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Side - Code Window */}
          <motion.div variants={fadeInUp} className="relative">
            <Card className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-0 overflow-hidden">
              {/* Code Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-950/50 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="ml-3 text-xs text-slate-400 font-mono">auth.setup.ts</span>
              </div>
              
              {/* Code Content */}
              <div className="p-6 font-mono text-sm">
                <pre className="text-slate-300 overflow-x-auto">
                  <code className="block">
                    <span className="text-violet-400">const</span> <span className="text-blue-400">auth</span> = <span className="text-violet-400">new</span> <span className="text-emerald-400">SecureAuth</span>({'{'}
                    {'\n'}  <span className="text-slate-500">// Your API key</span>
                    {'\n'}  <span className="text-amber-400">apiKey</span>: <span className="text-green-400">"sk_live_..."</span>,
                    {'\n'}  <span className="text-amber-400">framework</span>: <span className="text-green-400">"nextjs"</span>
                    {'\n'}{'}'});
                    {'\n\n'}
                    <span className="text-violet-400">await</span> <span className="text-blue-400">auth</span>.<span className="text-emerald-400">protect</span>(<span className="text-green-400">"/dashboard"</span>);
                  </code>
                </pre>
              </div>
            </Card>
            
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg blur-xl -z-10" />
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
