import React from "react";
import { getResults, getChampionshipData } from "@/actions/results";
import { getEvents } from "@/actions/events";
import { getCategories } from "@/actions/categories";
import { getHouses, getSiteSettings } from "@/actions/settings";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  PublicResultsClient,
  type PublicResultItem,
} from "@/components/public/PublicResultsClient";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const res = await getSiteSettings();
  const settings = res.data || DEFAULT_SITE_SETTINGS;
  return {
    title: `Results & Team Standings | ${settings.siteName || "IZAZOV 9.0"}`,
    description: "Live scores, winners, and team championship standings.",
  };
}

export default async function PublicResultsPage() {
  const [resultsRes, eventsRes, categoriesRes, housesRes, settingsRes, championshipRes] =
    await Promise.all([
      getResults(undefined, true), // Only published results
      getEvents(),
      getCategories(false),
      getHouses(),
      getSiteSettings(),
      getChampionshipData(),
    ]);

  const results = resultsRes.data || [];
  const events = (eventsRes.data || []).map((e) => ({
    id: e.id,
    name: e.name,
    code: e.code,
  }));
  const categories = (categoriesRes.data || []).map((c) => ({
    id: c.id,
    name: c.name,
  }));
  const houses = (housesRes.data || []).map((h) => ({
    id: h.id,
    name: h.name,
    shortName: h.shortName,
  }));
  const settings = settingsRes.data || DEFAULT_SITE_SETTINGS;

  const defaultChampionship = {
    totalPublishedCount: 0,
    checkpointCount: 0,
    nextCheckpoint: 5,
    resultsUntilNextCheckpoint: 5,
    liveTeamStandings: [],
    publicTeamStandings: [],
    individualStandings: [],
  };

  const championship = championshipRes.data || defaultChampionship;

  return (
    <div className="min-h-screen bg-[var(--background,#000000)] text-[var(--foreground,#FFFFFF)] flex flex-col selection:bg-[var(--brand,#931827)]">
      <PublicNavbar settings={settings} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand,#931827)]">
            Official Festival Leaderboard
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Results & Team Championship
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Official competition scores, verified winner podiums, and the continuous Team Championship standings updated at 5-result checkpoints.
          </p>
        </div>

        <PublicResultsClient
          results={results as unknown as PublicResultItem[]}
          events={events}
          categories={categories}
          houses={houses}
          championship={championship}
        />
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
