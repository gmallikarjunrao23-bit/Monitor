"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { PulseLine } from "@/components/dashboard/PulseLine";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-8 w-8">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-md bg-signal/20" />
              <div className="absolute inset-[3px] rounded-[4px] bg-signal animate-glow-pulse" />
            </div>
          </div>
          <h1 className="font-display text-xl font-semibold text-text-primary">Welcome back</h1>
          <p className="mt-1 text-sm text-text-secondary">Sign in to your InfraOps workspace</p>
        </div>

        <div className="h-8 w-full opacity-50">
          <PulseLine status="up" className="h-full w-full" />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-md border border-incident/30 bg-incident/10 px-3 py-2 text-sm text-incident">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-signal"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-signal"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-signal py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-text-muted">or continue with</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="rounded-md border border-border bg-surface py-2 text-sm text-text-primary transition-colors hover:bg-surface-hover"
          >
            Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="rounded-md border border-border bg-surface py-2 text-sm text-text-primary transition-colors hover:bg-surface-hover"
          >
            GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Don't have an account?{" "}
          <a href="/register" className="text-signal hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
