"use client";

import React from "react";
import Link from "next/link";
import { Menu, Globe, User, Shield } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function AdminHeader({
  user,
  onOpenMobileNav,
}: {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  onOpenMobileNav: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#242122] bg-[#0c0b0c]/90 px-4 sm:px-8 backdrop-blur-md">
      {/* Left: Mobile menu trigger & status */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden rounded-xl border border-[#2d292a] p-2 text-zinc-300 hover:bg-[#1f1d1e] hover:text-white"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-zinc-300">Live Fest Operations</span>
        </div>
      </div>

      {/* Right: Public Site Link & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#2e2a2b] bg-[#161415] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition"
        >
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden xs:inline">Public Site</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-[#242122]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#231f20] border border-[#383334] text-zinc-300">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">
                {user.name || "Administrator"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-2.5 h-2.5 text-[#931827]" />
                <span className="text-[10px] uppercase font-medium tracking-wider text-zinc-400">
                  {user.role || "ADMIN"}
                </span>
              </div>
            </div>
            <Badge variant="primary" className="hidden sm:inline-flex md:hidden">
              {user.role || "ADMIN"}
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}
