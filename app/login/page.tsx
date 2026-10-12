"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, Loader2, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)] px-4 py-12 relative overflow-hidden transition-colors">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[var(--brand-muted)] rounded-full blur-3xl pointer-events-none" />

      {/* Floating Theme Toggle in top right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle size="md" variant="dropdown" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Top Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Fest Site</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-elevated)] space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--brand)] flex items-center justify-center font-black text-white text-xs shadow-md shadow-[var(--brand)]/20 border border-white/20">
                IZ
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
                  IZAZOV 9.0
                </p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">
                  Festival Management Platform
                </p>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight pt-2">
              Operations Login
            </h1>

            <p className="text-xs text-[var(--text-muted)]">
              Authorized coordinators, judges, and administrator portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@izazov9.com"
                  required
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  required
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-600 dark:text-rose-300 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--brand)] px-4 py-3 font-semibold text-[var(--brand-foreground)] shadow-md shadow-[var(--brand)]/20 transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
              <span>{loading ? "Signing in..." : "Sign In to Operations"}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-[var(--border-subtle)] text-center">
            <p className="text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3 text-[var(--brand)]" />
              <span>IZAZOV 9.0 • Campus Operations & Security Portal</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}