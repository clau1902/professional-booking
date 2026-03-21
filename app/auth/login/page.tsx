"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only allow internal paths as callback to prevent open redirect
  const raw = searchParams.get("callbackUrl") ?? "/dashboard";
  const callbackUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await signIn.email(
      { email, password },
      { onSuccess: () => { router.push(callbackUrl); router.refresh(); } }
    );

    if (signInError) {
      setError(signInError.message ?? "Login failed.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[var(--foreground)]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 70%, oklch(0.55 0.18 38 / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.72 0.12 82 / 0.2) 0%, transparent 40%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[var(--terra)] flex items-center justify-center">
              <span className="text-white text-xs font-bold">H</span>
            </span>
            <span className="font-display text-xl font-semibold text-white">Handpicked</span>
          </Link>

          <div>
            <blockquote className="font-display text-3xl font-light text-white leading-relaxed mb-6 italic">
              &ldquo;Finding a great cleaner used to take weeks of referrals.
              Now it takes 5 minutes.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--terra)] flex items-center justify-center text-white text-sm font-bold">
                ST
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Sarah T.</p>
                <p className="text-white/60 text-xs">Customer since 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--cream)]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-light mb-2">Welcome back</h1>
            <p className="text-[var(--muted-foreground)]">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-[var(--terra)] hover:underline font-medium">
                Sign up free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 rounded-xl h-12"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link href="/auth/forgot-password" className="text-xs text-[var(--terra)] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl h-12 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl text-base font-medium"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--muted-foreground)] mt-8">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

