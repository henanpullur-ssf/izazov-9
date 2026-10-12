"use client";

import React from "react";
import Link from "next/link";
import { Menu, Globe, User, Shield } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface)]/90 px-4 sm:px-8 backdrop-blur-md transition-colors">
      {/* Left: Mobile menu trigger & status */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden rounded-xl border border-[var(--border-strong)] p-2 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[var(--foreground)]">Live Fest Operations</span>
        </div>
      </div>

      {/* Right: Theme Toggle, Public Site Link & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <ThemeToggle size="md" variant="dropdown" />

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition shadow-xs"
        >
          <Globe className="w-3.5 h-3.5 text-[var(--brand)]" />
          <span className="hidden xs:inline">Public Site</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--border-subtle)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--brand)] shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-[var(--foreground)] leading-tight">
                {user.name || "Administrator"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-2.5 h-2.5 text-[var(--brand)]" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
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
