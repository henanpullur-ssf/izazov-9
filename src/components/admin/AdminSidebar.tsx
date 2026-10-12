"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
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
  Images,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { hasPermission, isSuperAdmin, type UserAuthContext } from "@/lib/permissions";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
        title: "Attendance Desk",
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
    ],
  },
  {
    title: "SCORING & RESULTS",
    moduleKey: "scoring",
    items: [
      {
        title: "Judges",
        href: "/admin/judges",
        icon: Award,
        permission: "judges.view",
      },
      {
        title: "Score Entry",
        href: "/admin/scoring",
        icon: Trophy,
        permission: "scoring.view",
      },
      {
        title: "Live Results",
        href: "/admin/results",
        icon: Trophy,
        permission: "results.view",
      },
      {
        title: "Championship",
        href: "/admin/championship",
        icon: Trophy,
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
      {
        title: "Gallery Archive",
        href: "/admin/gallery",
        icon: Images,
        permission: "gallery.view",
      },
    ],
  },
  {
    title: "SYSTEM & ACCESS",
    moduleKey: "system",
    superAdminOnly: true,
    items: [
      {
        title: "User Management",
        href: "/admin/users",
        icon: Users,
        permission: "users.view",
        superAdminOnly: true,
      },
      {
        title: "Site Settings",
        href: "/admin/settings",
        icon: Sliders,
        permission: "settings.view",
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

  const authUser: UserAuthContext | null = user || (userRole ? { role: userRole, isActive: true } : null);
  const superAdmin = isSuperAdmin(authUser);

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  }

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
    <aside className="flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border-subtle)] select-none transition-colors">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--border-subtle)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--brand)] flex items-center justify-center font-black text-white text-base tracking-wider shadow-md shadow-[var(--brand)]/20 border border-white/20">
          IZ
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-[var(--foreground)] tracking-wide">
              IZAZOV
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--brand)] text-[var(--brand-foreground)] font-bold tracking-tight">
              9.0
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
            Fest Operations
          </p>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {visibleSections.map((section) => {
          return (
            <div key={section.title} className="space-y-1.5">
              <p className="px-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
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
                          ? "bg-[var(--brand)] text-[var(--brand-foreground)] font-semibold shadow-md shadow-[var(--brand)]/20"
                          : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? "text-[var(--brand-foreground)]" : "text-[var(--text-muted)]"
                        }`}
                      />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span
                          className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
                            active
                              ? "bg-white text-[var(--brand)] font-bold"
                              : "bg-[var(--surface-elevated)] text-[var(--text-muted)]"
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

      {/* Footer / Theme & Logout */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            Theme
          </span>
          <ThemeToggle variant="segmented" />
        </div>

        {authUser?.role && (
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border-subtle)] rounded-lg text-center flex items-center justify-center gap-1.5 shadow-2xs">
            {superAdmin ? (
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
            ) : null}
            <span>{authUser.role.replace("_", " ")}</span>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
