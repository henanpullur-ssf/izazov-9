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
  Camera,
} from "lucide-react";
import type { SiteSettingsData } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface PublicNavbarProps {
  settings?: SiteSettingsData | null;
}

export function PublicNavbar({ settings }: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = settings?.siteName || "IZAZOV 9.0";
  const shortName = settings?.shortName || "9.0";
  const logoUrl = settings?.logoUrl || "/logo.png";

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
      show: settings ? settings.showGalleryNav : true,
      label: "Gallery",
      href: "/gallery",
      icon: Camera,
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
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--background)]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={siteName}
              className="h-9 w-auto max-w-[120px] object-contain group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[var(--brand)] flex items-center justify-center font-black text-white text-sm tracking-wider shadow-md border border-white/20 group-hover:scale-105 transition-transform">
              {shortName ? shortName.slice(0, 2).toUpperCase() : siteName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight">
              {siteName}
            </span>
            {shortName && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--brand)] text-[var(--brand-foreground)] font-bold tracking-tight">
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
                    ? "bg-[var(--surface-elevated)] text-[var(--foreground)] font-semibold border border-[var(--border-subtle)] shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Theme Toggle & Admin Login */}
        <div className="hidden sm:flex items-center gap-2.5">
          <ThemeToggle size="md" variant="dropdown" />

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--brand)] hover:text-[var(--brand)] hover:bg-[var(--surface-elevated)] transition shadow-xs"
          >
            <Shield className="w-3.5 h-3.5 text-[var(--brand)]" />
            <span>Admin Portal</span>
          </Link>
        </div>

        {/* Mobile Buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle size="sm" variant="cycle" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-[var(--brand)] text-[var(--brand-foreground)] font-semibold shadow-xs"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Theme Selector for Mobile */}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Appearance
            </span>
            <ThemeToggle variant="segmented" />
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
            >
              <Shield className="w-4 h-4 text-[var(--brand)]" />
              <span>Admin Portal Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
