"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  MapPin,
  Clock,
  QrCode,
  HeartHandshake,
  Award,
  Trophy,
  Megaphone,
  Sliders,
  LogOut,
  Sparkles,
  Tag,
} from "lucide-react";
import { signOut } from "next-auth/react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: string[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "FEST MANAGEMENT",
    items: [
      {
        title: "Events",
        href: "/admin/events",
        icon: Sparkles,
      },
      {
        title: "Categories",
        href: "/admin/categories",
        icon: Tag,
      },
      {
        title: "Teams",
        href: "/admin/teams",
        icon: Users,
      },
      {
        title: "Participants",
        href: "/admin/participants",
        icon: Users,
      },
      {
        title: "Registrations",
        href: "/admin/registrations",
        icon: ClipboardList,
      },
      {
        title: "Venues",
        href: "/admin/venues",
        icon: MapPin,
      },
      {
        title: "Schedule",
        href: "/admin/schedule",
        icon: Clock,
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        title: "Attendance",
        href: "/admin/attendance",
        icon: QrCode,
      },
      {
        title: "Volunteers",
        href: "/admin/volunteers",
        icon: HeartHandshake,
      },
      {
        title: "Judges",
        href: "/admin/judges",
        icon: Award,
      },
    ],
  },
  {
    title: "COMPETITION",
    items: [
      {
        title: "Scoring",
        href: "/admin/scoring",
        icon: Calendar,
      },
      {
        title: "Results",
        href: "/admin/results",
        icon: Trophy,
      },
      {
        title: "Championship",
        href: "/admin/championship",
        icon: Award,
      },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      {
        title: "Announcements",
        href: "/admin/announcements",
        icon: Megaphone,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Sliders,
      },
    ],
  },
];

export function AdminSidebar({
  userRole,
  onItemClick,
}: {
  userRole?: string;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex flex-col h-full bg-[#111011] border-r border-[#262223] select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#232021]">
        <div className="w-9 h-9 rounded-xl bg-[#931827] flex items-center justify-center font-black text-white text-base tracking-wider shadow-md shadow-[#931827]/30 border border-red-400/20">
          IZ
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-white tracking-wide">
              IZAZOV
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#931827] text-white font-bold tracking-tight">
              9.0
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
            Fest Operations
          </p>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {ADMIN_NAV_SECTIONS.map((section) => {
          return (
            <div key={section.title} className="space-y-1.5">
              <p className="px-3 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onItemClick}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? "bg-[#931827] text-white font-semibold shadow-md shadow-[#931827]/25"
                          : "text-zinc-300 hover:text-white hover:bg-[#1f1d1e]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? "text-white" : "text-zinc-400"
                        }`}
                      />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span
                          className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full ${
                            active
                              ? "bg-white text-[#931827]"
                              : "bg-[#231f20] text-zinc-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[#232021] bg-[#0c0b0c]/60 space-y-2">
        {userRole && (
          <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400 bg-[#191718] border border-[#2b2728] rounded-md text-center">
            Role: {userRole}
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
