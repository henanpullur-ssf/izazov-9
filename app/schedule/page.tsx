import React from "react";
import { getSchedules } from "@/actions/schedule";
import { getVenues } from "@/actions/venues";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicScheduleClient, type PublicScheduleItem } from "@/components/public/PublicScheduleClient";
import { FEST_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Schedule & Itinerary | ${FEST_NAME}`,
  description: "Comprehensive festival timeline and venue schedules.",
};

export default async function PublicSchedulePage() {
  const [schedulesRes, venuesRes] = await Promise.all([
    getSchedules(),
    getVenues(),
  ]);

  const schedules = schedulesRes.data || [];
  const venues = (venuesRes.data || []).map((v) => ({
    id: v.id,
    name: v.name,
  }));

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col selection:bg-[#931827]">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#931827]">
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
        />
      </main>

      <PublicFooter />
    </div>
  );
}
