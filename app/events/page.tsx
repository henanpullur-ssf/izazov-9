import React from "react";
import { getEvents } from "@/actions/events";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicEventsClient, type PublicEventItem } from "@/components/public/PublicEventsClient";
import { FEST_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Events Catalog | ${FEST_NAME}`,
  description: "Browse all competitions, workshops, and spectacles.",
};

export default async function PublicEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const res = await getEvents();
  const events = res.data || [];

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col selection:bg-[#931827]">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#931827]">
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

      <PublicFooter />
    </div>
  );
}
