"use client";

import React, { useState, useMemo } from "react";
import {
  Trophy,
  Search,
  Flame,
  Clock,
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

export interface PublicResultItem {
  id: string;
  eventId: string;
  position: number | null;
  points: number;
  totalMarks: number;
  grade: string | null;
  prizeLevel: string | null;
  remarks: string | null;
  isWinner: boolean;
  isPublished: boolean;
  event: {
    id: string;
    code: string;
    name: string;
    category: string | null;
  };
  participant: {
    name: string;
    rollNumber: string | null;
    participantId: string;
    house: { name: string } | null;
  } | null;
  registration: {
    registrationNumber: string;
    teamName: string | null;
    participants: {
      participant: {
        id: string;
        name: string;
        rollNumber: string | null;
        participantId: string;
        house: { name: string } | null;
      };
    }[];
  };
}

export interface PublicChampionshipData {
  totalPublishedCount: number;
  checkpointCount: number;
  nextCheckpoint: number;
  resultsUntilNextCheckpoint: number;
  publicTeamStandings: {
    id: string;
    name: string;
    shortName: string | null;
    points: number;
    gold: number;
    silver: number;
    bronze: number;
    consolation: number;
    special: number;
    rank: number;
  }[];
}

export function PublicResultsClient({
  results,
  events = [],
  categories = [],
  houses = [],
  championship,
}: {
  results: PublicResultItem[];
  events: { id: string; name: string; code: string }[];
  categories?: { id: string; name: string }[];
  houses?: { id: string; name: string; shortName: string | null }[];
  championship?: PublicChampionshipData;
}) {
  const [selectedEventId, setSelectedEventId] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  const categoryOptions = useMemo(() => {
    const names = new Set(categories.map((c) => c.name));
    results.forEach((r) => {
      if (r.event.category) names.add(r.event.category);
    });
    return Array.from(names);
  }, [categories, results]);

  const filteredResults = useMemo(() => {
    const q = search.toLowerCase().trim();

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

      const rollNo =
        r.participant?.rollNumber ||
        r.registration.participants[0]?.participant?.rollNumber ||
        "";

      const pId =
        r.participant?.participantId ||
        r.registration.participants[0]?.participant?.participantId ||
        r.registration.registrationNumber ||
        "";

      const matchSearch =
        q === "" ||
        participantName.toLowerCase().includes(q) ||
        rollNo.toLowerCase().includes(q) ||
        pId.toLowerCase().includes(q) ||
        r.event.name.toLowerCase().includes(q) ||
        r.event.code.toLowerCase().includes(q);

      return matchEvent && matchCat && matchSearch;
    });
  }, [results, selectedEventId, selectedCategory, search]);

  const teamLeaderboard = useMemo(() => {
    if (championship?.publicTeamStandings && championship.publicTeamStandings.length > 0) {
      return championship.publicTeamStandings;
    }

    const map: Record<string, { id: string; name: string; shortName: string | null; points: number; gold: number; silver: number; bronze: number; consolation: number; special: number; rank: number }> = {};
    houses.forEach((h) => {
      map[h.id] = { id: h.id, name: h.name, shortName: h.shortName, points: 0, gold: 0, silver: 0, bronze: 0, consolation: 0, special: 0, rank: 1 };
    });

    return Object.values(map);
  }, [championship, houses]);

  return (
    <div className="space-y-10">
      {/* Team Championship Standings Section (Checkpoint based) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#931827]" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Team Championship Standings
            </h2>
          </div>

          {/* Checkpoint Status Pill */}
          {championship && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181516] border border-[#332e30] text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-zinc-300">
                {championship.checkpointCount > 0 ? (
                  <>
                    Updated after{" "}
                    <strong className="text-amber-400">
                      {championship.checkpointCount} results
                    </strong>{" "}
                    • Next update at{" "}
                    <strong className="text-zinc-100">
                      {championship.nextCheckpoint} results
                    </strong>{" "}
                    ({championship.resultsUntilNextCheckpoint} remaining)
                  </>
                ) : (
                  <>
                    Standing updates after first{" "}
                    <strong className="text-amber-400">5 results</strong> (
                    {championship.totalPublishedCount} published so far)
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {teamLeaderboard.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamLeaderboard.map((team) => (
              <Card
                key={team.id || team.name}
                className={`p-5 relative overflow-hidden transition ${
                  team.rank === 1
                    ? "border-amber-500/60 bg-gradient-to-b from-[#1c160c] to-[#121112]"
                    : "hover:border-[#383334]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#931827]">
                      RANK #{team.rank}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      Team {team.name}
                    </h3>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base ${
                      team.rank === 1
                        ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                        : "bg-[#201d1e] text-zinc-300 border border-[#332f30]"
                    }`}
                  >
                    {team.rank === 1 ? "👑" : `#${team.rank}`}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#232021] flex items-center justify-between">
                  <div className="text-xs text-zinc-400">
                    <span>🥇 {team.gold}</span> • <span>🥈 {team.silver}</span> •{" "}
                    <span>🥉 {team.bronze}</span>
                  </div>
                  <span className="text-base font-mono font-black text-white">
                    {team.points} pts
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Results Filter Bar */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#931827]" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Official Competition Results
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
              placeholder="Search participant, roll no, team, or event..."
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
              {categoryOptions.map((c) => (
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
            description="Results are published in real-time as officials submit verified event scores."
          />
        ) : (
          <div className="space-y-3">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Rank</TableHeader>
                    <TableHeader>Participant / Entry</TableHeader>
                    <TableHeader>Competition</TableHeader>
                    <TableHeader>Team</TableHeader>
                    <TableHeader>Grade / Prize</TableHeader>
                    <TableHeader className="text-right">Points</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResults.map((r) => {
                    const participantName =
                      r.registration.teamName ||
                      r.participant?.name ||
                      r.registration.participants[0]?.participant?.name ||
                      "Participant";

                    const rollNo =
                      r.participant?.rollNumber ||
                      r.registration.participants[0]?.participant?.rollNumber ||
                      null;

                    const teamName =
                      r.participant?.house?.name ||
                      r.registration.participants[0]?.participant?.house?.name ||
                      "—";

                    const pts = r.points !== undefined && r.points !== null ? r.points : r.totalMarks;

                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                              r.position === 1 || r.prizeLevel === "1st Prize"
                                ? "bg-amber-500 text-black font-extrabold"
                                : r.position === 2 || r.prizeLevel === "2nd Prize"
                                ? "bg-zinc-300 text-black"
                                : r.position === 3 || r.prizeLevel === "3rd Prize"
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
                            <div className="flex items-center gap-1.5">
                              {rollNo && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#201d1e] text-zinc-300 border border-[#332f30]">
                                  Roll: {rollNo}
                                </span>
                              )}
                              {r.isWinner && (
                                <Badge variant="warning" className="text-[10px]">
                                  CHAMPION
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="text-xs font-semibold text-white">
                              {r.event.name}
                            </span>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              {r.event.code} {r.event.category ? `• ${r.event.category}` : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="info">Team {teamName}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {r.prizeLevel && r.prizeLevel !== "No Prize" && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                {r.prizeLevel}
                              </span>
                            )}
                            {r.grade && (
                              <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                                {r.grade}
                              </span>
                            )}
                            {!r.prizeLevel && !r.grade && (
                              <span className="text-xs text-zinc-500">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-black text-white text-sm">
                          {pts} pts
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
