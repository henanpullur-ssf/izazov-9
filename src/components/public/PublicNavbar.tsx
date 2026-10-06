"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Sparkles,
  Calendar,
  Trophy,
  Megaphone,
  MapPin,
  Info,
  Shield,
} from "lucide-react";
import type { SiteSettingsData } from "@/lib/constants";

interface PublicNavbarProps {
  settings?: SiteSettingsData | null;
}

export function PublicNavbar({ settings }: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = settings?.siteName || "IZAZOV";
  const shortName = settings?.shortName || "9.0";
  const logoUrl = settings?.logoUrl;

  const navLinks = [
    {
      show: settings ? settings.showEvents : true,
      label: "Events",
      href: "/events",
      icon: Sparkles,
    },
    {
      show: settings ? settings.showScheduleNav : true,
      label: "Schedule",
      href: "/schedule",
      icon: Calendar,
    },
    {
      show: settings ? settings.showResultsNav : true,
      label: "Results",
      href: "/results",
      icon: Trophy,
    },
    {
      show: settings ? settings.showAnnouncementsNav : true,
      label: "Announcements",
      href: "/announcements",
      icon: Megaphone,
    },
    {
      show: settings ? settings.showVenuesNav : true,
      label: "Venues",
      href: "/venues",
      icon: MapPin,
    },
    {
      show: settings ? settings.showAboutNav : true,
      label: "About",
      href: "/about",
      icon: Info,
    },
  ].filter((item) => item.show);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle,#232021)] bg-[var(--background,#000000)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={siteName}
              className="h-8 w-auto max-w-[120px] object-contain rounded-lg group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[var(--brand,#931827)] flex items-center justify-center font-black text-white text-sm tracking-wider shadow-md shadow-red-950/30 border border-red-400/20 group-hover:scale-105 transition-transform">
              {shortName ? shortName.slice(0, 2).toUpperCase() : siteName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-extrabold text-white tracking-wider">
              {siteName}
            </span>
            {shortName && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--brand,#931827)] text-white font-bold tracking-tight">
                {shortName}
              </span>
            )}
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                  active
                    ? "bg-[var(--surface,#231f20)] text-white font-semibold border border-[var(--border-subtle,#383334)]"
                    : "text-zinc-400 hover:text-white hover:bg-[var(--surface-elevated,#181617)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Admin Login */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle,#383334)] bg-[var(--surface-card,#161415)] px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-[var(--brand,#931827)] hover:text-white hover:bg-[var(--surface,#201416)] transition"
          >
            <Shield className="w-3.5 h-3.5 text-[var(--brand,#931827)]" />
            <span>Admin Portal</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl border border-[var(--border-subtle,#2d292a)] text-zinc-400 hover:text-white hover:bg-[var(--surface,#1a1819)]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-subtle,#232021)] bg-[var(--surface-card,#0d0c0d)] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  active
                    ? "bg-[var(--brand,#931827)] text-white font-semibold"
                    : "text-zinc-300 hover:bg-[var(--surface,#1a1819)] hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[var(--border-subtle,#232021)]">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-[var(--border-subtle,#383334)] bg-[var(--surface-card,#161415)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Shield className="w-4 h-4 text-[var(--brand,#931827)]" />
              <span>Admin Portal Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
