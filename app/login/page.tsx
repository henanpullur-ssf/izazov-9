"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, Loader2 } from "lucide-react";

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
    <main className="flex min-h-screen items-center justify-center bg-[#000000] px-4 py-12 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#931827]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Top Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Public Fest Site</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-[#2d292a] bg-[#121112] p-8 shadow-2xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#931827] flex items-center justify-center font-bold text-white text-xs shadow-md shadow-[#931827]/30">
                IZ
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#931827]">
                IZAZOV 9.0
              </p>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Operations Login
            </h1>

            <p className="text-xs text-zinc-400">
              Authorized coordinators, judges, and admins portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@izazov9.com"
                  required
                  className="w-full rounded-xl border border-[#2e2a2b] bg-[#0c0b0c] pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#931827] focus:ring-2 focus:ring-[#931827]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  required
                  className="w-full rounded-xl border border-[#2e2a2b] bg-[#0c0b0c] pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#931827] focus:ring-2 focus:ring-[#931827]/30"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#931827] px-4 py-3 font-semibold text-white shadow-lg shadow-[#931827]/25 transition hover:bg-[#a81c2e] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
              <span>{loading ? "Signing in..." : "Sign In to Operations"}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-[#232021] text-center">
            <p className="text-[11px] text-zinc-500">
              IZAZOV 9.0 • Campus Operations & Security Portal
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}