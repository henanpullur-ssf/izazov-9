"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  UserCheck,
  Search,
  Shield,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export interface TeamItem {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  logoUrl: string | null;
  totalMembers: number;
  totalPoints: number;
  rank: number;
  manager: { id: string; name: string; participantId: string; rollNumber?: string | null } | null;
  assistantManager: { id: string; name: string; participantId: string; rollNumber?: string | null } | null;
  prizes: {
    gold: number;
    silver: number;
    bronze: number;
    consolation: number;
    special: number;
  };
}

export function TeamListClient({ teams }: { teams: TeamItem[] }) {
  const [search, setSearch] = useState("");

  const filteredTeams = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return teams;
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.shortName && t.shortName.toLowerCase().includes(q)) ||
        (t.manager && t.manager.name.toLowerCase().includes(q)) ||
        (t.assistantManager && t.assistantManager.name.toLowerCase().includes(q))
    );
  }, [teams, search]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams by name, manager..."
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#931827]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>Total Teams: <strong className="text-[var(--foreground)]">{teams.length}</strong></span>
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <EmptyState
          icon={<Shield className="w-6 h-6 text-[var(--text-dim)]" />}
          title="No teams found"
          description={
            search
              ? "No teams match your search criteria."
              : "No festival teams have been configured in the system."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTeams.map((team) => (
            <Card
              key={team.id}
              className={`p-6 relative overflow-hidden transition hover:border-[var(--border-strong)] flex flex-col justify-between gap-5 ${
                team.rank === 1
                  ? "border-amber-500/50 bg-gradient-to-br from-[#1c160c] to-[#121112]"
                  : ""
              }`}
            >
              <div className="space-y-4">
                {/* Card Top: Rank & Name */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[var(--brand)] uppercase">
                        Rank #{team.rank}
                      </span>
                      {team.shortName && (
                        <Badge variant="neutral" className="text-[10px]">
                          {team.shortName}
                        </Badge>
                      )}
                      {team.rank === 1 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          LEADER
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Team {team.name}
                    </h3>
                    {team.description && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                        {team.description}
                      </p>
                    )}
                  </div>

                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
                      team.rank === 1
                        ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                        : team.rank === 2
                        ? "bg-zinc-300 text-black"
                        : team.rank === 3
                        ? "bg-amber-800 text-white"
                        : "bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                    }`}
                  >
                    {team.rank === 1 ? "👑" : `#${team.rank}`}
                  </div>
                </div>

                {/* Score & Medals Stats */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[var(--surface)] border border-[#262223]">
                  <div>
                    <span className="text-[10px] text-[var(--text-dim)] uppercase font-semibold">
                      Total Fest Points
                    </span>
                    <p className="text-xl font-mono font-black text-white mt-0.5">
                      {team.totalPoints} <span className="text-xs text-[var(--text-muted)] font-bold">pts</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-dim)] uppercase font-semibold">
                      Team Members
                    </span>
                    <p className="text-xl font-mono font-black text-[var(--foreground)] mt-0.5">
                      {team.totalMembers} <span className="text-xs text-[var(--text-muted)] font-normal">participants</span>
                    </p>
                  </div>
                </div>

                {/* Managers Overview */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#171516] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <UserCheck className="w-3.5 h-3.5 text-[var(--brand)]" />
                      <span>Team Manager:</span>
                    </div>
                    <span className="font-bold text-white">
                      {team.manager ? team.manager.name : <em className="text-[var(--text-dim)] not-italic">Unassigned</em>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#171516] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <UserCheck className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                      <span>Assistant Manager:</span>
                    </div>
                    <span className="font-bold text-white">
                      {team.assistantManager ? team.assistantManager.name : <em className="text-[var(--text-dim)] not-italic">Unassigned</em>}
                    </span>
                  </div>
                </div>

                {/* Prizes Banner */}
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1 pt-1">
                  <span>🏆 1st: <strong className="text-amber-400">{team.prizes.gold}</strong></span>
                  <span>🥈 2nd: <strong className="text-[var(--foreground)]">{team.prizes.silver}</strong></span>
                  <span>🥉 3rd: <strong className="text-amber-600">{team.prizes.bronze}</strong></span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <Link href={`/admin/teams/${team.id}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full justify-between">
                    <span>Manage Team & Members</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
