import React from "react";
import { getEvents } from "@/actions/events";
import { getSiteSettings } from "@/actions/settings";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  PublicEventsClient,
  type PublicEventItem,
} from "@/components/public/PublicEventsClient";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const res = await getSiteSettings();
  const settings = res.data || DEFAULT_SITE_SETTINGS;
  return {
    title: `Events Catalog | ${settings.siteName || "IZAZOV 9.0"}`,
    description: "Browse all competitions, workshops, and spectacles.",
  };
}

export default async function PublicEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [eventsRes, settingsRes] = await Promise.all([
    getEvents(),
    getSiteSettings(),
  ]);

  const events = eventsRes.data || [];
  const settings = settingsRes.data || DEFAULT_SITE_SETTINGS;

  return (
    <div className="min-h-screen bg-[var(--background,#000000)] text-[var(--foreground,#FFFFFF)] flex flex-col selection:bg-[var(--brand,#931827)]">
      <PublicNavbar settings={settings} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand,#931827)]">
            Competitions & Tracks
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Festival Events
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Register and compete in cultural, technical, literary, arts, and gaming championships across the campus.
          </p>
        </div>

        <PublicEventsClient
          events={events as unknown as PublicEventItem[]}
          initialCategory={category}
        />
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
