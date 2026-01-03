"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Sparkles, ArrowRight, Zap, Users, Clock } from "lucide-react";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Authentication not configured");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/hub");
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError("Authentication not configured");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-slate-900 font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-semibold">SpokeStack</span>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI-Powered Operations</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight">
                Empower your team to do
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400"> amazing work</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-md">
                The intelligent operations platform for professional services teams. Briefs, time, resources, and AI — all in one place.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid gap-4">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <span>AI-assisted brief creation and content generation</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Users className="h-4 w-4 text-cyan-400" />
                </div>
                <span>Real-time team capacity and resource planning</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <Clock className="h-4 w-4 text-violet-400" />
                </div>
                <span>Automated time tracking with retainer insights</span>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-slate-300 italic">
                &quot;SpokeStack transformed how our agency operates. We&apos;ve cut brief turnaround time by 40% and finally have visibility into our retainer health.&quot;
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/50 to-cyan-500/50 flex items-center justify-center text-sm font-medium">
                  CJ
                </div>
                <div>
                  <p className="font-medium">CJ Ocampo</p>
                  <p className="text-sm text-slate-400">Creative Director, TeamLMTD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg">
                <span className="text-slate-900 font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-semibold">SpokeStack</span>
            </div>
          </div>

          <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-800/50 dark:backdrop-blur-xl dark:border dark:border-slate-700/50">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Sign in to continue to your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-11 relative overflow-hidden group"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                    required
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 group"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <div className="text-sm text-muted-foreground text-center">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary font-medium hover:underline">
                  Get started
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Trust indicators */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Trusted by leading agencies worldwide
            </p>
            <div className="flex items-center justify-center gap-6 opacity-50">
              <div className="text-sm font-semibold text-muted-foreground">LMTD</div>
              <div className="text-sm font-semibold text-muted-foreground">ADEK</div>
              <div className="text-sm font-semibold text-muted-foreground">DET</div>
              <div className="text-sm font-semibold text-muted-foreground">ECD</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
