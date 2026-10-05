"use client";

import React, { useState, useMemo } from "react";
import {
  Trophy,
  Search,
  Flame,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/Table";
import { EVENT_CATEGORIES } from "@/lib/constants";

export interface PublicResultItem {
  id: string;
  eventId: string;
  position: number | null;
  totalMarks: number;
  isWinner: boolean;
  event: {
    id: string;
    code: string;
    name: string;
    category: string | null;
  };
  participant: {
    name: string;
    house: { name: string } | null;
  } | null;
  registration: {
    registrationNumber: string;
    teamName: string | null;
    participants: {
      participant: {
        id: string;
        name: string;
        house: { name: string } | null;
      };
    }[];
  };
}

export function PublicResultsClient({
  results,
  events = [],
  houses = [],
}: {
  results: PublicResultItem[];
  events: { id: string; name: string; code: string }[];
  houses: { id: string; name: string; shortName: string | null }[];
}) {
  const [selectedEventId, setSelectedEventId] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const matchEvent =
        selectedEventId === "ALL" || r.eventId === selectedEventId;
      const matchCat =
        selectedCategory === "ALL" || r.event.category === selectedCategory;

      const participantName =
        r.registration.teamName ||
        r.participant?.name ||
        r.registration.participants[0]?.participant?.name ||
        "";

      const matchSearch =
        search === "" ||
        participantName.toLowerCase().includes(search.toLowerCase()) ||
        r.event.name.toLowerCase().includes(search.toLowerCase()) ||
        r.event.code.toLowerCase().includes(search.toLowerCase());

      return matchEvent && matchCat && matchSearch;
    });
  }, [results, selectedEventId, selectedCategory, search]);

  // House Points Calculation from Results
  const houseLeaderboard = useMemo(() => {
    const map: Record<string, { name: string; points: number; gold: number; silver: number; bronze: number }> = {};
    houses.forEach((h) => {
      map[h.name] = { name: h.name, points: 0, gold: 0, silver: 0, bronze: 0 };
    });

    results.forEach((r) => {
      const houseName =
        r.participant?.house?.name ||
        r.registration.participants[0]?.participant?.house?.name;

      if (houseName && map[houseName]) {
        const pts = Number(r.totalMarks) || 0;
        map[houseName].points += pts;
        if (r.position === 1) map[houseName].gold += 1;
        else if (r.position === 2) map[houseName].silver += 1;
        else if (r.position === 3) map[houseName].bronze += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.points - a.points);
  }, [results, houses]);

  return (
    <div className="space-y-10">
      {/* House Championship Standings Grid */}
      {houseLeaderboard.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#931827]" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              House Championship Trophy Standings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {houseLeaderboard.map((house, idx) => (
              <Card
                key={house.name}
                className={`p-5 relative overflow-hidden transition ${
                  idx === 0
                    ? "border-amber-500/60 bg-gradient-to-b from-[#1c160c] to-[#121112]"
                    : "hover:border-[#383334]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#931827]">
                      RANK #{idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {house.name}
                    </h3>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base ${
                      idx === 0
                        ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                        : "bg-[#201d1e] text-zinc-300 border border-[#332f30]"
                    }`}
                  >
                    {idx === 0 ? "👑" : `#${idx + 1}`}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#232021] flex items-center justify-between">
                  <div className="text-xs text-zinc-400">
                    <span>🥇 {house.gold}</span> • <span>🥈 {house.silver}</span> •{" "}
                    <span>🥉 {house.bronze}</span>
                  </div>
                  <span className="text-base font-mono font-bold text-white">
                    {house.points} pts
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Results Filter Bar */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#931827]" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Competition Leaderboards
            </h2>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-[#2d292a] bg-[#121112] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search participant, team, or event..."
              className="w-full rounded-xl border border-[#332f30] bg-[#0c0b0c] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#931827]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              aria-label="Filter Results by Event"
              className="rounded-xl border border-[#332f30] bg-[#181617] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#931827] cursor-pointer"
            >
              <option value="ALL">All Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.code} - {e.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter Results by Category"
              className="rounded-xl border border-[#332f30] bg-[#181617] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#931827] cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-6 h-6 text-zinc-500" />}
            title="No results match your filters"
            description="Results are published in real-time as judges submit final scores."
          />
        ) : (
          <div className="space-y-3">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Rank</TableHeader>
                    <TableHeader>Participant / Team</TableHeader>
                    <TableHeader>Competition</TableHeader>
                    <TableHeader>House</TableHeader>
                    <TableHeader className="text-right">Score</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResults.map((r) => {
                    const participantName =
                      r.registration.teamName ||
                      r.participant?.name ||
                      r.registration.participants[0]?.participant?.name ||
                      "Participant";

                    const houseName =
                      r.participant?.house?.name ||
                      r.registration.participants[0]?.participant?.house?.name ||
                      "—";

                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                              r.position === 1
                                ? "bg-amber-500 text-black font-extrabold"
                                : r.position === 2
                                ? "bg-zinc-300 text-black"
                                : r.position === 3
                                ? "bg-amber-800 text-white"
                                : "bg-[#231f20] text-zinc-400"
                            }`}
                          >
                            {r.position ? `#${r.position}` : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-bold text-white text-sm">
                              {participantName}
                            </span>
                            {r.isWinner && (
                              <div>
                                <Badge variant="warning" className="text-[10px]">
                                  CHAMPION
                                </Badge>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="text-xs font-semibold text-white">
                              {r.event.name}
                            </span>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              {r.event.code}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="info">{houseName}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-white text-sm">
                          {r.totalMarks} pts
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
    </div>
  );
}
