"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Flame,
  Search,
  Lock,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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

export interface TeamStanding {
  id: string;
  name: string;
  shortName: string | null;
  memberCount: number;
  managerName: string | null;
  assistantManagerName: string | null;
  points: number;
  gold: number;
  silver: number;
  bronze: number;
  consolation: number;
  special: number;
  rank: number;
}

export interface IndividualStanding {
  id: string;
  participantId: string;
  rollNumber: string | null;
  name: string;
  teamName: string | null;
  points: number;
  gold: number;
  silver: number;
  bronze: number;
  consolation: number;
  special: number;
  resultCount: number;
  rank: number;
}

export interface ChampionshipData {
  totalPublishedCount: number;
  checkpointCount: number;
  nextCheckpoint: number;
  resultsUntilNextCheckpoint: number;
  liveTeamStandings: TeamStanding[];
  publicTeamStandings: TeamStanding[];
  individualStandings: IndividualStanding[];
}

export function ChampionshipDashboardClient({
  data,
}: {
  data: ChampionshipData;
}) {
  const [activeTab, setActiveTab] = useState<"teams" | "individual" | "public_preview">("teams");
  const [individualSearch, setIndividualSearch] = useState("");

  const filteredIndividuals = useMemo(() => {
    const q = individualSearch.toLowerCase().trim();
    if (!q) return data.individualStandings;
    return data.individualStandings.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.participantId.toLowerCase().includes(q) ||
        (p.rollNumber && p.rollNumber.toLowerCase().includes(q)) ||
        (p.teamName && p.teamName.toLowerCase().includes(q))
    );
  }, [data.individualStandings, individualSearch]);

  return (
    <div className="space-y-8">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Published Results */}
        <Card className="p-5 bg-gradient-to-br from-[#1c170f] to-[#121112] border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Published Results
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-white">
              {data.totalPublishedCount}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-semibold">competitions</span>
          </div>
          <p className="text-[11px] text-[var(--text-dim)] mt-1">
            Contributing to live championship totals
          </p>
        </Card>

        {/* Public Checkpoint Standings */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Public Checkpoint
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">
              {data.checkpointCount}
            </span>
            <span className="text-xs text-[var(--text-muted)]">results locked</span>
          </div>
          <p className="text-[11px] text-[var(--text-dim)] mt-1">
            Public scoreboard updates at 5-result milestones
          </p>
        </Card>

        {/* Next Checkpoint Target */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Next Public Checkpoint
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#231f20] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-white">
              {data.nextCheckpoint}
            </span>
            <span className="text-xs text-[var(--text-muted)]">results target</span>
          </div>
          <p className="text-[11px] text-[var(--text-dim)] mt-1">
            Next public standings update threshold
          </p>
        </Card>

        {/* Results Until Next Update */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Results Until Update
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-red-400">
              {data.resultsUntilNextCheckpoint}
            </span>
            <span className="text-xs text-[var(--text-muted)]">more needed</span>
          </div>
          <p className="text-[11px] text-[var(--text-dim)] mt-1">
            Publish {data.resultsUntilNextCheckpoint} more to trigger public update
          </p>
        </Card>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--surface)] border border-[#272425] max-w-fit">
        <button
          onClick={() => setActiveTab("teams")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === "teams"
              ? "bg-[var(--brand)] text-white shadow-md shadow-[var(--brand)]/30"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Live Team Championship</span>
        </button>

        <button
          onClick={() => setActiveTab("individual")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === "individual"
              ? "bg-[var(--brand)] text-white shadow-md shadow-[var(--brand)]/30"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Individual Championship (Admin Only)</span>
        </button>

        <button
          onClick={() => setActiveTab("public_preview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === "public_preview"
              ? "bg-[var(--brand)] text-white shadow-md shadow-[var(--brand)]/30"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Public 5-Checkpoint Preview</span>
        </button>
      </div>

      {/* Tab 1: Live Team Championship Standings */}
      {activeTab === "teams" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-[var(--brand)]" />
                <span>Admin Live Team Championship Leaderboard</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Real-time scoreboard calculating cumulative points from all {data.totalPublishedCount} published competition results.
              </p>
            </div>
            <Link href="/admin/teams">
              <Button variant="secondary" size="sm">
                <span>View Team Profiles</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.liveTeamStandings.map((team) => (
              <Card
                key={team.id}
                className={`p-5 relative overflow-hidden transition ${
                  team.rank === 1
                    ? "border-amber-500/60 bg-gradient-to-b from-[#1c160c] to-[#121112]"
                    : "hover:border-[var(--border-subtle)]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-[var(--brand)]">
                      RANK #{team.rank}
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      Team {team.name}
                    </h3>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base ${
                      team.rank === 1
                        ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                        : "bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                    }`}
                  >
                    {team.rank === 1 ? "👑" : `#${team.rank}`}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">Total Points:</span>
                    <span className="text-lg font-mono font-black text-white">
                      {team.points} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>🥇 {team.gold}</span> • <span>🥈 {team.silver}</span> •{" "}
                    <span>🥉 {team.bronze}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                  <Link href={`/admin/teams/${team.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Manage Team
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Rank</TableHeader>
                  <TableHeader>Team Name</TableHeader>
                  <TableHeader>Leadership</TableHeader>
                  <TableHeader>Members</TableHeader>
                  <TableHeader>Medals (1st / 2nd / 3rd)</TableHeader>
                  <TableHeader className="text-right">Total Points</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.liveTeamStandings.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-bold text-sm ${
                          t.rank === 1
                            ? "bg-amber-500 text-black font-black"
                            : t.rank === 2
                            ? "bg-zinc-300 text-black"
                            : t.rank === 3
                            ? "bg-amber-800 text-white"
                            : "bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                        }`}
                      >
                        {t.rank === 1 ? "👑" : `#${t.rank}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/teams/${t.id}`}
                        className="font-bold text-white hover:text-red-400 hover:underline text-base"
                      >
                        Team {t.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-[var(--text-muted)] space-y-0.5">
                        <p>Manager: <strong className="text-[var(--foreground)]">{t.managerName || "Unassigned"}</strong></p>
                        <p>Asst: <span className="text-[var(--text-muted)]">{t.assistantManagerName || "Unassigned"}</span></p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[var(--text-muted)]">
                        {t.memberCount} members
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-[var(--text-muted)] space-x-2">
                        <span>🥇 <strong className="text-amber-400">{t.gold}</strong></span>
                        <span>🥈 <strong className="text-[var(--foreground)]">{t.silver}</strong></span>
                        <span>🥉 <strong className="text-amber-600">{t.bronze}</strong></span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-lg font-mono font-black text-white">
                        {t.points} pts
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {/* Tab 2: Individual Championship Leaderboard (ADMIN ONLY) */}
      {activeTab === "individual" && (
        <div className="space-y-6">
          {/* Admin Notice Banner */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <span>CONFIDENTIAL • ADMIN-ONLY INDIVIDUAL CHAMPIONSHIP</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                  INTERNAL ONLY
                </span>
              </h3>
              <p className="text-xs text-amber-200/80 mt-1">
                This individual leaderboard ranks fest participants by cumulative published points from manually entered event results. This scoreboard is strictly hidden from the public website.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--surface)] p-4 rounded-2xl border border-[#272425]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={individualSearch}
                onChange={(e) => setIndividualSearch(e.target.value)}
                placeholder="Search ranked participants by name, roll no, ID, or team..."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#931827]"
              />
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              <span>Total Ranked: <strong className="text-[var(--foreground)]">{data.individualStandings.length}</strong> participants</span>
            </div>
          </div>

          {filteredIndividuals.length === 0 ? (
            <EmptyState
              icon={<Award className="w-6 h-6 text-[var(--text-dim)]" />}
              title="No individual results recorded"
              description="Individual participant rankings will appear here automatically as results are published."
            />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Rank</TableHeader>
                    <TableHeader>Participant</TableHeader>
                    <TableHeader>Roll No.</TableHeader>
                    <TableHeader>Participant ID</TableHeader>
                    <TableHeader>Team</TableHeader>
                    <TableHeader>Results Count</TableHeader>
                    <TableHeader>Prizes (1st / 2nd / 3rd)</TableHeader>
                    <TableHeader className="text-right">Total Points</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredIndividuals.map((p) => (
                    <TableRow key={p.id} className={p.rank === 1 ? "bg-amber-950/15" : ""}>
                      <TableCell>
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-bold text-xs ${
                            p.rank === 1
                              ? "bg-amber-500 text-black font-black shadow-md shadow-amber-500/20"
                              : p.rank === 2
                              ? "bg-zinc-300 text-black font-bold"
                              : p.rank === 3
                              ? "bg-amber-800 text-white font-bold"
                              : "bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                          }`}
                        >
                          {p.rank === 1 ? "🥇" : `#${p.rank}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/participants/${p.id}`}
                          className="font-bold text-white hover:text-red-400 hover:underline text-sm"
                        >
                          {p.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-bold text-xs text-[var(--text-muted)]">
                          {p.rollNumber || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="primary" className="text-[10px]">
                          {p.participantId}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.teamName ? (
                          <Badge variant="info">Team {p.teamName}</Badge>
                        ) : (
                          <span className="text-xs text-[var(--text-dim)]">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[var(--text-muted)]">
                          {p.resultCount} events
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-[var(--text-muted)] space-x-1.5">
                          <span>🥇 {p.gold}</span>
                          <span>🥈 {p.silver}</span>
                          <span>🥉 {p.bronze}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-base font-mono font-black text-amber-400">
                          {p.points} pts
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      )}

      {/* Tab 3: Public 5-Checkpoint Preview */}
      {activeTab === "public_preview" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[var(--surface-elevated)]/60 border border-[var(--border-strong)]/50 space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Public Scoreboard Mirror</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              This preview shows the Team Championship standings as currently seen by visitors on the public website. Public scores are calculated strictly from the first <strong>{data.checkpointCount}</strong> published results.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.publicTeamStandings.map((team) => (
              <Card
                key={team.id}
                className={`p-5 relative overflow-hidden ${
                  team.rank === 1
                    ? "border-amber-500/60 bg-gradient-to-b from-[#1c160c] to-[#121112]"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-[var(--brand)]">
                      RANK #{team.rank}
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      Team {team.name}
                    </h3>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base ${
                      team.rank === 1
                        ? "bg-amber-500 text-black font-black"
                        : "bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                    }`}
                  >
                    {team.rank === 1 ? "👑" : `#${team.rank}`}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="text-xs text-[var(--text-muted)]">
                    <span>🥇 {team.gold}</span> • <span>🥈 {team.silver}</span> •{" "}
                    <span>🥉 {team.bronze}</span>
                  </div>
                  <span className="text-lg font-mono font-black text-white">
                    {team.points} pts
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
