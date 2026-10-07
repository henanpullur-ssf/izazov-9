"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Eye,
  Trash2,
  QrCode,
  PlusCircle,
  Phone,
  Mail,
  ArrowUpDown,
  Trophy,
} from "lucide-react";
import { SearchFilterBar } from "@/components/ui/SearchFilterBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/Table";
import { deleteParticipant } from "@/actions/participants";

export interface ParticipantListItem {
  id: string;
  participantId: string;
  rollNumber: string | null;
  name: string;
  gender: string | null;
  email: string | null;
  phone: string | null;
  qrToken: string;
  totalPoints?: number;
  house?: { id: string; name: string } | null;
  createdAt?: Date | string;
  _count?: {
    registrations: number;
    attendance: number;
    results: number;
  };
}

export function ParticipantListClient({
  participants,
  houses = [],
}: {
  participants: ParticipantListItem[];
  houses: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [houseId, setHouseId] = useState("ALL");
  const [sortBy, setSortBy] = useState<"name" | "rollNumber" | "participantId" | "house" | "points" | "createdAt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [deleteTarget, setDeleteTarget] = useState<ParticipantListItem | null>(null);
  const [qrModalTarget, setQrModalTarget] = useState<ParticipantListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredAndSortedParticipants = useMemo(() => {
    const q = search.toLowerCase().trim();

    const filtered = participants.filter((p) => {
      const matchesSearch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.participantId.toLowerCase().includes(q) ||
        (p.rollNumber && p.rollNumber.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q));

      const matchesHouse = houseId === "ALL" || p.house?.id === houseId;

      return matchesSearch && matchesHouse;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "rollNumber") {
        comparison = (a.rollNumber || "").localeCompare(b.rollNumber || "");
      } else if (sortBy === "participantId") {
        comparison = a.participantId.localeCompare(b.participantId);
      } else if (sortBy === "house") {
        comparison = (a.house?.name || "").localeCompare(b.house?.name || "");
      } else if (sortBy === "points") {
        comparison = (a.totalPoints || 0) - (b.totalPoints || 0);
      } else if (sortBy === "createdAt") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = timeA - timeB;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [participants, search, houseId, sortBy, sortOrder]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteParticipant(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, roll no, participant ID, email, or phone..."
        filters={[
          {
            id: "house",
            label: "Team",
            value: houseId,
            options: [
              { label: "All Teams", value: "ALL" },
              ...houses.map((h) => ({ label: `Team ${h.name}`, value: h.id })),
            ],
            onChange: setHouseId,
          },
        ]}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort Controls */}
          <div className="flex items-center gap-1.5 bg-[#141213] border border-[#2b2728] rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort participants by"
              className="bg-transparent text-white outline-none cursor-pointer text-xs"
            >
              <option value="name" className="bg-[#141213]">Name</option>
              <option value="rollNumber" className="bg-[#141213]">Roll Number</option>
              <option value="participantId" className="bg-[#141213]">Participant ID</option>
              <option value="points" className="bg-[#141213]">Total Points</option>
              <option value="house" className="bg-[#141213]">Team</option>
              <option value="createdAt" className="bg-[#141213]">Registration Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              aria-label="Toggle sort order"
              className="p-1 hover:bg-[#272425] rounded transition text-zinc-400 hover:text-white"
              title={sortOrder === "asc" ? "Ascending (Click for Descending)" : "Descending (Click for Ascending)"}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link href="/admin/participants/new">
            <Button size="sm" className="gap-1.5 whitespace-nowrap">
              <PlusCircle className="w-4 h-4" />
              <span>Add Participant</span>
            </Button>
          </Link>
        </div>
      </SearchFilterBar>

      {filteredAndSortedParticipants.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-zinc-500" />}
          title="No participants found"
          description={
            search || houseId !== "ALL"
              ? "Try adjusting your search query, sort order, or team filter."
              : "Register your first participant for IZAZOV 9.0."
          }
          actionLabel="Add Participant"
          actionHref="/admin/participants/new"
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Roll No.</TableHeader>
                    <TableHeader>Participant</TableHeader>
                    <TableHeader>Team</TableHeader>
                    <TableHeader>Total Points</TableHeader>
                    <TableHeader>Contact Details</TableHeader>
                    <TableHeader>Events / Activity</TableHeader>
                    <TableHeader>Pass Token</TableHeader>
                    <TableHeader className="text-right">Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedParticipants.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <span className="font-mono font-bold text-xs text-zinc-300">
                          {p.rollNumber || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <Link
                            href={`/admin/participants/${p.id}`}
                            className="font-semibold text-white hover:text-red-400 hover:underline transition"
                          >
                            {p.name}
                          </Link>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="primary" className="text-[10px]">
                              {p.participantId}
                            </Badge>
                            {p.gender && (
                              <span className="text-xs text-zinc-500">
                                • {p.gender}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.house ? (
                          <Link href={`/admin/teams/${p.house.id}`}>
                            <Badge variant="info" className="hover:opacity-80 transition cursor-pointer">
                              Team {p.house.name}
                            </Badge>
                          </Link>
                        ) : (
                          <span className="text-xs text-zinc-500">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#1c1812] border border-amber-500/25">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          <span className="text-xs font-mono font-bold text-amber-300">
                            {p.totalPoints || 0} pts
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 text-xs text-zinc-400">
                          {p.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-zinc-500" />
                              <span>{p.email}</span>
                            </div>
                          )}
                          {p.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-zinc-500" />
                              <span>{p.phone}</span>
                            </div>
                          )}
                          {!p.email && !p.phone && (
                            <span className="text-zinc-500">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-zinc-400 space-y-0.5">
                          <p>{p._count?.registrations || 0} registered</p>
                          <p className="text-[11px] text-zinc-500">
                            {p._count?.attendance || 0} attended
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => setQrModalTarget(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#383334] bg-[#1a1819] px-2.5 py-1 text-xs text-zinc-300 hover:border-[#931827] hover:text-white transition cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#931827]" />
                          <span>Pass</span>
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/participants/${p.id}`}>
                            <Button variant="secondary" size="sm">
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline ml-1">Profile</span>
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(p)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredAndSortedParticipants.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-[#2d292a] bg-[#141314] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.rollNumber && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#201d1e] text-zinc-300 border border-[#332f30]">
                          Roll: {p.rollNumber}
                        </span>
                      )}
                      <Badge variant="primary" className="text-[10px]">
                        {p.participantId}
                      </Badge>
                      {p.house && (
                        <Badge variant="info" className="text-[10px]">
                          Team {p.house.name}
                        </Badge>
                      )}
                    </div>
                    <Link
                      href={`/admin/participants/${p.id}`}
                      className="font-bold text-white text-base hover:text-red-400 block"
                    >
                      {p.name}
                    </Link>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-mono font-bold text-amber-400">
                      {p.totalPoints || 0} pts
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-zinc-400 pt-2 border-t border-[#232021]">
                  {p.email && <p className="truncate">Email: {p.email}</p>}
                  {p.phone && <p>Phone: {p.phone}</p>}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232021]">
                  <Link href={`/admin/participants/${p.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(p)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* QR Pass Modal */}
      <Modal
        isOpen={Boolean(qrModalTarget)}
        onClose={() => setQrModalTarget(null)}
        title="Participant QR Pass Token"
        maxWidth="sm"
      >
        {qrModalTarget && (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
            <div className="p-6 rounded-2xl bg-[#201d1e] border-2 border-[#931827] shadow-xl">
              <QrCode className="w-32 h-32 text-white mx-auto stroke-[1.2]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">
                {qrModalTarget.name}
              </h4>
              <p className="text-xs font-mono font-semibold text-[#931827]">
                {qrModalTarget.participantId} {qrModalTarget.rollNumber ? `• Roll: ${qrModalTarget.rollNumber}` : ""}
              </p>
              {qrModalTarget.house && (
                <p className="text-xs text-zinc-400">
                  Team: {qrModalTarget.house.name}
                </p>
              )}
            </div>
            <div className="w-full p-3 rounded-xl bg-[#0c0b0c] border border-[#2d292a] text-left">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                Raw Token String
              </p>
              <p className="text-xs font-mono text-zinc-300 break-all select-all mt-1">
                {qrModalTarget.qrToken}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Participant"
        message={`Are you sure you want to remove "${deleteTarget?.name}" (${deleteTarget?.participantId})? This will delete all registered entries and attendance records for this participant.`}
        confirmLabel="Delete Participant"
        isLoading={isDeleting}
      />
    </div>
  );
}
