import React from "react";
import { getResults } from "@/actions/results";
import { getEvents } from "@/actions/events";
import { getHouses } from "@/actions/settings";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicResultsClient, type PublicResultItem } from "@/components/public/PublicResultsClient";
import { FEST_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Results & Leaderboard | ${FEST_NAME}`,
  description: "Live scores, winners, and house championship standings.",
};

export default async function PublicResultsPage() {
  const [resultsRes, eventsRes, housesRes] = await Promise.all([
    getResults(),
    getEvents(),
    getHouses(),
  ]);

  const results = resultsRes.data || [];
  const events = (eventsRes.data || []).map((e) => ({
    id: e.id,
    name: e.name,
    code: e.code,
  }));
  const houses = (housesRes.data || []).map((h) => ({
    id: h.id,
    name: h.name,
    shortName: h.shortName,
  }));

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col selection:bg-[#931827]">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#931827]">
            Scores & Champions
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Leaderboard & Results
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Live festival scorecards, verified winner podiums, and the continuous House Championship points race.
          </p>
        </div>

        <PublicResultsClient
          results={results as unknown as PublicResultItem[]}
          events={events}
          houses={houses}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
