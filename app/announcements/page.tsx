import React from "react";
import { Megaphone, Pin } from "lucide-react";
import { getAnnouncements } from "@/actions/announcements";
import { getSiteSettings } from "@/actions/settings";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatTime, DEFAULT_SITE_SETTINGS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const res = await getSiteSettings();
  const settings = res.data || DEFAULT_SITE_SETTINGS;
  return {
    title: `Announcements & Bulletins | ${settings.siteName || "IZAZOV 9.0"}`,
    description: "Official notifications, schedule changes, and live bulletins.",
  };
}

export default async function PublicAnnouncementsPage() {
  const [announcementsRes, settingsRes] = await Promise.all([
    getAnnouncements(true),
    getSiteSettings(),
  ]);

  const announcements = announcementsRes.data || [];
  const settings = settingsRes.data || DEFAULT_SITE_SETTINGS;

  return (
    <div className="min-h-screen bg-[var(--background,#000000)] text-[var(--foreground,#FFFFFF)] flex flex-col selection:bg-[var(--brand,#931827)]">
      <PublicNavbar settings={settings} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand,#931827)]">
            Official Updates & Alerts
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Festival Announcements
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Live broadcasts from the fest committee, including schedule adjustments, round calls, and gate instructions.
          </p>
        </div>

        {announcements.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="w-6 h-6 text-zinc-500" />}
            title="No active bulletins"
            description="Check back during festival hours for real-time announcements."
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <Card
                key={a.id}
                className={`p-5 sm:p-6 transition ${
                  a.isPinned
                    ? "border-amber-500/50 bg-gradient-to-r from-[#17140e] to-[#121112]"
                    : a.priority === "URGENT"
                    ? "border-red-600/50 bg-[#160f10]"
                    : "hover:border-[var(--border-subtle,#383334)]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {a.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded-full">
                          <Pin className="w-3 h-3" /> PINNED BULLETIN
                        </span>
                      )}
                      <StatusBadge status={a.priority} />
                    </div>

                    <span className="text-xs text-zinc-400 font-medium">
                      {formatDate(a.createdAt)} • {formatTime(a.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {a.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                    {a.content}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
