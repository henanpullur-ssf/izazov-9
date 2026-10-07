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
  ShieldCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { hasPermission, isSuperAdmin, type UserAuthContext } from "@/lib/permissions";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  permission?: string;
  superAdminOnly?: boolean;
}

export interface NavSection {
  title: string;
  moduleKey?: string;
  superAdminOnly?: boolean;
  items: NavItem[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    moduleKey: "dashboard",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        permission: "dashboard.view",
      },
    ],
  },
  {
    title: "FEST MANAGEMENT",
    moduleKey: "fest_management",
    items: [
      {
        title: "Events",
        href: "/admin/events",
        icon: Sparkles,
        permission: "events.view",
      },
      {
        title: "Categories",
        href: "/admin/categories",
        icon: Tag,
        permission: "categories.view",
      },
      {
        title: "Teams",
        href: "/admin/teams",
        icon: Users,
        permission: "teams.view",
      },
      {
        title: "Participants",
        href: "/admin/participants",
        icon: Users,
        permission: "participants.view",
      },
      {
        title: "Registrations",
        href: "/admin/registrations",
        icon: ClipboardList,
        permission: "registrations.view",
      },
      {
        title: "Venues",
        href: "/admin/venues",
        icon: MapPin,
        permission: "venues.view",
      },
      {
        title: "Schedule",
        href: "/admin/schedule",
        icon: Clock,
        permission: "schedule.view",
      },
    ],
  },
  {
    title: "OPERATIONS",
    moduleKey: "operations",
    items: [
      {
        title: "Attendance",
        href: "/admin/attendance",
        icon: QrCode,
        permission: "attendance.view",
      },
      {
        title: "Volunteers",
        href: "/admin/volunteers",
        icon: HeartHandshake,
        permission: "volunteers.view",
      },
      {
        title: "Judges",
        href: "/admin/judges",
        icon: Award,
        permission: "judges.view",
      },
    ],
  },
  {
    title: "COMPETITION",
    moduleKey: "competition",
    items: [
      {
        title: "Scoring",
        href: "/admin/scoring",
        icon: Calendar,
        permission: "scoring.view",
      },
      {
        title: "Results",
        href: "/admin/results",
        icon: Trophy,
        permission: "results.view",
      },
      {
        title: "Championship",
        href: "/admin/championship",
        icon: Award,
        permission: "championship.view",
      },
    ],
  },
  {
    title: "COMMUNICATION",
    moduleKey: "communication",
    items: [
      {
        title: "Announcements",
        href: "/admin/announcements",
        icon: Megaphone,
        permission: "announcements.view",
      },
    ],
  },
  {
    title: "ADMINISTRATION",
    superAdminOnly: true,
    items: [
      {
        title: "Staff & Users",
        href: "/admin/users",
        icon: ShieldCheck,
        superAdminOnly: true,
      },
    ],
  },
  {
    title: "SYSTEM",
    superAdminOnly: true,
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Sliders,
        superAdminOnly: true,
      },
    ],
  },
];

export function AdminSidebar({
  user,
  userRole,
  onItemClick,
}: {
  user?: UserAuthContext | null;
  userRole?: string;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();

  // Create an auth context fallback if only userRole was provided
  const authUser: UserAuthContext | null = user || (userRole ? { role: userRole, isActive: true } : null);
  const superAdmin = isSuperAdmin(authUser);

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  }

  // Filter sections and items based on permissions
  const visibleSections = ADMIN_NAV_SECTIONS.map((section) => {
    if (section.superAdminOnly && !superAdmin) {
      return null;
    }

    const filteredItems = section.items.filter((item) => {
      if (item.superAdminOnly && !superAdmin) return false;
      if (superAdmin) return true;
      if (!item.permission) return true;
      return hasPermission(authUser, item.permission);
    });

    if (filteredItems.length === 0) {
      return null;
    }

    return {
      ...section,
      items: filteredItems,
    };
  }).filter(Boolean) as NavSection[];

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
        {visibleSections.map((section) => {
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
        {authUser?.role && (
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-zinc-300 bg-[#191718] border border-[#2b2728] rounded-md text-center flex items-center justify-center gap-1.5">
            {superAdmin ? (
              <ShieldCheck className="w-3.5 h-3.5 text-red-400 shrink-0" />
            ) : null}
            <span>{authUser.role.replace("_", " ")}</span>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
