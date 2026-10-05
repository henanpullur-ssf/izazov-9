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

export const NAV_LINKS = [
  { label: "Events", href: "/events", icon: Sparkles },
  { label: "Schedule", href: "/schedule", icon: Calendar },
  { label: "Results", href: "/results", icon: Trophy },
  { label: "Announcements", href: "/announcements", icon: Megaphone },
  { label: "Venues", href: "/venues", icon: MapPin },
  { label: "About", href: "/about", icon: Info },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#232021] bg-[#000000]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#931827] flex items-center justify-center font-black text-white text-sm tracking-wider shadow-md shadow-[#931827]/30 border border-red-400/20 group-hover:scale-105 transition-transform">
            IZ
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-extrabold text-white tracking-wider">
              IZAZOV
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#931827] text-white font-bold tracking-tight">
              9.0
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                  active
                    ? "bg-[#231f20] text-white font-semibold border border-[#383334]"
                    : "text-zinc-400 hover:text-white hover:bg-[#181617]"
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
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#383334] bg-[#161415] px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-[#931827] hover:text-white hover:bg-[#201416] transition"
          >
            <Shield className="w-3.5 h-3.5 text-[#931827]" />
            <span>Admin Portal</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl border border-[#2d292a] text-zinc-400 hover:text-white hover:bg-[#1a1819]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#232021] bg-[#0d0c0d] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  active
                    ? "bg-[#931827] text-white font-semibold"
                    : "text-zinc-300 hover:bg-[#1a1819] hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#232021]">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#383334] bg-[#161415] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Shield className="w-4 h-4 text-[#931827]" />
              <span>Admin Portal Login</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
