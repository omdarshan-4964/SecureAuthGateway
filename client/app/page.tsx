import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <Zap className="w-4 h-4 mr-2 text-primary" />
            Payment-Grade Security Infrastructure
          </Badge>

          {/* Title with Gradient */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent">
              SecureAuth Gateway
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Enterprise authentication infrastructure with JWT, RBAC, and OAuth 2.0.
            Built for fintech applications that demand 99.9% reliability.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="shadow-lg shadow-primary/50">
                <Shield className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16">
            <Card className="p-6 space-y-4 bg-card/40 backdrop-blur-sm border-border/50 hover:bg-card/60 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Stateless JWT Auth</h3>
              <p className="text-muted-foreground">
                Dual-token system with 15min access tokens and 7-day refresh tokens.
                Zero database lookups for verification.
              </p>
            </Card>

            <Card className="p-6 space-y-4 bg-card/40 backdrop-blur-sm border-border/50 hover:bg-card/60 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Granular RBAC with USER, MERCHANT, and ADMIN roles.
                Fine-grained permission control per endpoint.
              </p>
            </Card>

            <Card className="p-6 space-y-4 bg-card/40 backdrop-blur-sm border-border/50 hover:bg-card/60 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold">Auto Token Refresh</h3>
              <p className="text-muted-foreground">
                Seamless token rotation with request queue management.
                Users never see authentication errors.
              </p>
            </Card>
          </div>

          {/* Tech Stack */}
          <div className="mt-16 space-y-4">
            <h2 className="text-2xl font-semibold text-muted-foreground">Built With</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {["Next.js 15", "TypeScript", "Tailwind CSS", "Node.js", "Express", "MongoDB", "JWT", "Bcrypt"].map((tech) => (
                <Badge key={tech} variant="secondary" className="px-4 py-2">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
