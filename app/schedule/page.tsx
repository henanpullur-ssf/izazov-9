import React from "react";
import { getSchedules } from "@/actions/schedule";
import { getVenues } from "@/actions/venues";
import { getCategories } from "@/actions/categories";
import { getSiteSettings } from "@/actions/settings";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  PublicScheduleClient,
  type PublicScheduleItem,
} from "@/components/public/PublicScheduleClient";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const res = await getSiteSettings();
  const settings = res.data || DEFAULT_SITE_SETTINGS;
  return {
    title: `Schedule & Itinerary | ${settings.siteName || "IZAZOV 9.0"}`,
    description: "Comprehensive festival timeline and venue schedules.",
  };
}

export default async function PublicSchedulePage() {
  const [schedulesRes, venuesRes, categoriesRes, settingsRes] =
    await Promise.all([
      getSchedules(),
      getVenues(),
      getCategories(false),
      getSiteSettings(),
    ]);

  const schedules = schedulesRes.data || [];
  const venues = (venuesRes.data || []).map((v) => ({
    id: v.id,
    name: v.name,
  }));
  const categories = (categoriesRes.data || []).map((c) => ({
    id: c.id,
    name: c.name,
  }));
  const settings = settingsRes.data || DEFAULT_SITE_SETTINGS;

  return (
    <div className="min-h-screen bg-[var(--background,#000000)] text-[var(--foreground,#FFFFFF)] flex flex-col selection:bg-[var(--brand,#931827)]">
      <PublicNavbar settings={settings} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand,#931827)]">
            Timeline & Itinerary
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Festival Schedule
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Live schedule of technical competitions, cultural performances, hackathons, and guest events across all campus venues.
          </p>
        </div>

        <PublicScheduleClient
          schedules={schedules as unknown as PublicScheduleItem[]}
          venues={venues}
          categories={categories}
        />
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
