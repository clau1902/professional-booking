"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, User, Briefcase } from "lucide-react";
import { Suspense } from "react";
import { signUp } from "@/lib/auth-client";

function friendlySignUpError(message?: string): string {
  const m = message?.toLowerCase() ?? "";
  if (m.includes("already exists") || m.includes("use another email"))
    return "We couldn't create an account with that email. Try a different one or sign in.";
  if (m.includes("invalid email"))
    return "That doesn't look like a valid email address.";
  if (m.includes("password too short"))
    return "Password must be at least 8 characters.";
  if (m.includes("password too long"))
    return "Password is too long. Please use fewer than 128 characters.";
  if (m.includes("failed to create user"))
    return "We couldn't create your account. Please try again in a moment.";
  if (m.includes("too many") || m.includes("rate"))
    return "Too many attempts. Please wait a moment and try again.";
  return "Something went wrong. Please try again.";
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "professional" ? "PROFESSIONAL" : "CUSTOMER";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"CUSTOMER" | "PROFESSIONAL">(defaultRole as "CUSTOMER" | "PROFESSIONAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function passwordStrength(p: string): { score: number; label: string; color: string } {
    if (!p) return { score: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { score, label: "Weak", color: "bg-red-400" };
    if (score <= 3) return { score, label: "Fair", color: "bg-amber-400" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  }
  const strength = passwordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");

    const { error: signUpError } = await signUp.email(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { name, email, password, role } as any
    );

    if (signUpError) {
      setError(friendlySignUpError(signUpError.message));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[var(--terra)]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 60% 40%, white 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
              <span className="text-[var(--terra)] text-xs font-bold">H</span>
            </span>
            <span className="font-display text-xl font-semibold text-white">Handpicked</span>
          </Link>

          <div>
            <h2 className="font-display text-4xl font-light text-white mb-6 leading-tight">
              Join 50,000+<br />
              <strong>happy customers</strong>
            </h2>
            <ul className="space-y-4">
              {[
                "Verified, background-checked professionals",
                "Instant booking with real-time availability",
                "Free cancellation up to 24 hours before",
                "Satisfaction guaranteed or money back",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/90 text-sm">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--cream)]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-light mb-2">Create your account</h1>
            <p className="text-[var(--muted-foreground)]">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[var(--terra)] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("CUSTOMER")}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                role === "CUSTOMER"
                  ? "border-[var(--terra)] bg-[var(--terra-light)]"
                  : "border-[var(--border)] hover:border-[var(--terra)]/40"
              }`}
            >
              <User size={20} className={`mb-2 ${role === "CUSTOMER" ? "text-[var(--terra)]" : "text-[var(--muted-foreground)]"}`} />
              <p className="font-semibold text-sm">Customer</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Find & book professionals</p>
            </button>
            <button
              type="button"
              onClick={() => setRole("PROFESSIONAL")}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                role === "PROFESSIONAL"
                  ? "border-[var(--terra)] bg-[var(--terra-light)]"
                  : "border-[var(--border)] hover:border-[var(--terra)]/40"
              }`}
            >
              <Briefcase size={20} className={`mb-2 ${role === "PROFESSIONAL" ? "text-[var(--terra)]" : "text-[var(--muted-foreground)]"}`} />
              <p className="font-semibold text-sm">Professional</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Offer your services</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1.5 rounded-xl h-12"
              />
            </div>

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
              <Label htmlFor="password" className="text-sm font-medium">
                Password <span className="text-[var(--muted-foreground)] font-normal">(min. 8 characters)</span>
              </Label>
              <div className="relative mt-1.5">
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
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i <= strength.score ? strength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.score <= 1 ? "text-red-500" :
                    strength.score <= 3 ? "text-amber-500" : "text-emerald-600"
                  }`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white rounded-xl text-base font-medium mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Create account"}
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
