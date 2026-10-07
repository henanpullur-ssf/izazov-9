"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Trophy,
  Medal,
  Flame,
  UserCheck,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
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
import { updateTeamManagers } from "@/actions/teams";

export interface TeamMemberItem {
  id: string;
  participantId: string;
  rollNumber: string | null;
  name: string;
  gender: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  totalPoints: number;
  registrationsCount: number;
  attendanceCount: number;
  prizes: {
    gold: number;
    silver: number;
    bronze: number;
  };
  isManager: boolean;
  isAssistantManager: boolean;
}

export interface TeamDetailData {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  logoUrl: string | null;
  managerId: string | null;
  assistantManagerId: string | null;
  manager: { id: string; name: string; participantId: string; rollNumber?: string | null } | null;
  assistantManager: { id: string; name: string; participantId: string; rollNumber?: string | null } | null;
  totalMembers: number;
  totalPoints: number;
  rank: number;
  prizes: {
    gold: number;
    silver: number;
    bronze: number;
    consolation: number;
    special: number;
  };
  members: TeamMemberItem[];
  allMembersList: {
    id: string;
    name: string;
    participantId: string;
    rollNumber: string | null;
  }[];
}

export function TeamDetailClient({ team }: { team: TeamDetailData }) {
  const router = useRouter();

  // Manager assignment state
  const [selectedManagerId, setSelectedManagerId] = useState<string>(team.managerId || "");
  const [selectedAsstManagerId, setSelectedAsstManagerId] = useState<string>(team.assistantManagerId || "");
  const [managerSaving, setManagerSaving] = useState(false);
  const [managerError, setManagerError] = useState("");
  const [managerSuccess, setManagerSuccess] = useState("");

  // Member search and sort state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"points" | "name" | "rollNumber" | "participantId">("points");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  async function handleSaveManagers(e: React.FormEvent) {
    e.preventDefault();
    setManagerError("");
    setManagerSuccess("");

    if (
      selectedManagerId &&
      selectedAsstManagerId &&
      selectedManagerId === selectedAsstManagerId
    ) {
      setManagerError("Team Manager and Assistant Team Manager cannot be the same participant.");
      return;
    }

    setManagerSaving(true);
    try {
      const res = await updateTeamManagers(
        team.id,
        selectedManagerId || null,
        selectedAsstManagerId || null
      );

      if (!res.success) {
        setManagerError(res.error || "Failed to update team leadership");
      } else {
        setManagerSuccess("Team leadership updated successfully!");
        router.refresh();
      }
    } catch {
      setManagerError("An unexpected error occurred while saving managers.");
    } finally {
      setManagerSaving(false);
    }
  }

  const filteredAndSortedMembers = useMemo(() => {
    const q = search.toLowerCase().trim();

    const filtered = team.members.filter((m) => {
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.participantId.toLowerCase().includes(q) ||
        (m.rollNumber && m.rollNumber.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        (m.phone && m.phone.includes(q))
      );
    });

    return filtered.sort((a, b) => {
      let comp = 0;
      if (sortBy === "name") {
        comp = a.name.localeCompare(b.name);
      } else if (sortBy === "rollNumber") {
        comp = (a.rollNumber || "").localeCompare(b.rollNumber || "");
      } else if (sortBy === "participantId") {
        comp = a.participantId.localeCompare(b.participantId);
      } else {
        // default: points
        comp = a.totalPoints - b.totalPoints;
      }

      return sortOrder === "asc" ? comp : -comp;
    });
  }, [team.members, search, sortBy, sortOrder]);

  return (
    <div className="space-y-8">
      {/* Team Header Overview */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#2f2b2c] bg-gradient-to-r from-[#1b1517] via-[#141213] to-[#121112] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-5">
          <div
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-3xl sm:text-4xl text-black shadow-xl shrink-0 ${
              team.rank === 1
                ? "bg-amber-500 shadow-amber-500/30"
                : team.rank === 2
                ? "bg-zinc-300"
                : team.rank === 3
                ? "bg-amber-800 text-white"
                : "bg-red-700 text-white"
            }`}
          >
            {team.rank === 1 ? "👑" : `#${team.rank}`}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#201d1e] border border-[#383334] text-[#931827]">
                CHAMPIONSHIP RANK #{team.rank}
              </span>
              {team.shortName && (
                <Badge variant="neutral">{team.shortName}</Badge>
              )}
              {team.rank === 1 && (
                <Badge variant="warning">CURRENT FESTIVAL LEADER</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              TEAM {team.name.toUpperCase()}
            </h1>
            {team.description && (
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                {team.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Points */}
        <Card className="p-5 bg-gradient-to-br from-[#1c170f] to-[#121112] border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Total Team Points
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-white">
              {team.totalPoints}
            </span>
            <span className="text-xs text-zinc-400 font-semibold">pts</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Sum of all published member scores
          </p>
        </Card>

        {/* Total Members */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total Members
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#231f20] border border-[#383334] flex items-center justify-center text-zinc-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-white">
              {team.totalMembers}
            </span>
            <span className="text-xs text-zinc-400">participants</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Assigned to Team {team.name}
          </p>
        </Card>

        {/* 1st Prize Gold Count */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              1st Prize Wins
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
              {team.prizes.gold}
            </span>
            <span className="text-xs text-zinc-400">gold titles</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Top podium festival victories
          </p>
        </Card>

        {/* Runner-Up Placements */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Runner-Up Medals
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-500/10 border border-zinc-500/30 flex items-center justify-center text-zinc-300">
              <Medal className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-zinc-200">
                {team.prizes.silver}
              </span>
              <span className="text-[10px] text-zinc-400">🥈 2nd</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-amber-600">
                {team.prizes.bronze}
              </span>
              <span className="text-[10px] text-zinc-400">🥉 3rd</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Silver & bronze medals
          </p>
        </Card>
      </div>

      {/* Leadership / Manager Assignment Section */}
      <Card className="overflow-hidden">
        <CardHeader className="py-4 bg-[#141213] border-b border-[#232021]">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#931827]" />
            <span>Team Leadership & Management</span>
          </CardTitle>
          <p className="text-xs text-zinc-400 mt-0.5">
            Assign Team Manager and Assistant Team Manager from registered team members.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSaveManagers} className="space-y-4 max-w-3xl">
            {managerError && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{managerError}</span>
              </div>
            )}

            {managerSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{managerSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <Select
                  label="Team Manager"
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  helperText="Primary representative for this team"
                >
                  <option value="">— Unassigned —</option>
                  {team.allMembersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.rollNumber ? `Roll: ${m.rollNumber} • ` : ""}{m.participantId})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <Select
                  label="Assistant Team Manager"
                  value={selectedAsstManagerId}
                  onChange={(e) => setSelectedAsstManagerId(e.target.value)}
                  helperText="Secondary contact & coordinator"
                >
                  <option value="">— Unassigned —</option>
                  {team.allMembersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.rollNumber ? `Roll: ${m.rollNumber} • ` : ""}{m.participantId})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3">
              <Button type="submit" size="sm" isLoading={managerSaving}>
                Save Leadership Assignments
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131213] p-4 rounded-2xl border border-[#272425]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team members by name, roll no, ID..."
              className="w-full rounded-xl border border-[#332f30] bg-[#0c0b0c] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#931827]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#0c0b0c] border border-[#2b2728] rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
              <span className="text-zinc-500 font-medium">Sort Members:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                aria-label="Sort team members by"
                className="bg-transparent text-white outline-none cursor-pointer text-xs"
              >
                <option value="points" className="bg-[#141213]">Total Points</option>
                <option value="name" className="bg-[#141213]">Name</option>
                <option value="rollNumber" className="bg-[#141213]">Roll Number</option>
                <option value="participantId" className="bg-[#141213]">Participant ID</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                aria-label="Toggle sort order"
                className="p-1 hover:bg-[#272425] rounded transition text-zinc-400 hover:text-white"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {filteredAndSortedMembers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6 text-zinc-500" />}
            title="No members found"
            description={
              search
                ? "No team members match your search filter."
                : "No participants have been assigned to this team yet."
            }
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Roll No.</TableHeader>
                  <TableHeader>Participant</TableHeader>
                  <TableHeader>Participant ID</TableHeader>
                  <TableHeader>Role</TableHeader>
                  <TableHeader>Total Points</TableHeader>
                  <TableHeader>Medals Won</TableHeader>
                  <TableHeader>Events Registered</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedMembers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <span className="font-mono font-bold text-xs text-zinc-300">
                        {m.rollNumber || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <Link
                          href={`/admin/participants/${m.id}`}
                          className="font-semibold text-white hover:text-red-400 hover:underline transition text-sm"
                        >
                          {m.name}
                        </Link>
                        {m.gender && (
                          <p className="text-[11px] text-zinc-500">{m.gender}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary" className="text-[10px]">
                        {m.participantId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {m.isManager ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800">
                          <UserCheck className="w-3 h-3" /> Team Manager
                        </span>
                      ) : m.isAssistantManager ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          <UserCheck className="w-3 h-3" /> Asst. Manager
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">Member</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#1c1812] border border-amber-500/25">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span className="text-xs font-mono font-black text-amber-300">
                          {m.totalPoints} pts
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-zinc-400 space-x-1.5">
                        <span>🥇 {m.prizes.gold}</span>
                        <span>🥈 {m.prizes.silver}</span>
                        <span>🥉 {m.prizes.bronze}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-zinc-400">
                        {m.registrationsCount} events
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/participants/${m.id}`}>
                        <Button variant="secondary" size="sm">
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>Profile</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
}
