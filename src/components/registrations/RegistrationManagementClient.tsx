"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { SearchFilterBar } from "@/components/ui/SearchFilterBar";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/Table";
import {
  createRegistration,
  updateRegistrationStatus,
  deleteRegistration,
} from "@/actions/registrations";
import { formatDate, REGISTRATION_STATUSES } from "@/lib/constants";
import { RegistrationStatus } from "@prisma/client";

export interface RegistrationItem {
  id: string;
  registrationNumber: string;
  eventId: string;
  status: RegistrationStatus;
  teamName: string | null;
  registeredAt: Date;
  event: {
    id: string;
    code: string;
    name: string;
    maxParticipants: number | null;
  };
  participants: {
    participant: {
      id: string;
      participantId: string;
      name: string;
      house: { name: string } | null;
    };
  }[];
}

export function RegistrationManagementClient({
  registrations,
  events = [],
  participants = [],
}: {
  registrations: RegistrationItem[];
  events: { id: string; name: string; code: string; maxParticipants: number | null }[];
  participants: { id: string; name: string; participantId: string; houseName?: string }[];
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RegistrationItem | null>(null);

  // Form State
  const [formEventId, setFormEventId] = useState(events[0]?.id || "");
  const [formTeamName, setFormTeamName] = useState("");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<RegistrationStatus>(
    RegistrationStatus.CONFIRMED
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setFormEventId(events[0]?.id || "");
    setFormTeamName("");
    setSelectedParticipantIds([]);
    setFormStatus(RegistrationStatus.CONFIRMED);
    setError("");
    setIsCreateOpen(true);
  }

  function toggleParticipantSelection(id: string) {
    if (selectedParticipantIds.includes(id)) {
      setSelectedParticipantIds(selectedParticipantIds.filter((p) => p !== id));
    } else {
      setSelectedParticipantIds([...selectedParticipantIds, id]);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (selectedParticipantIds.length === 0) {
      setError("Please select at least one participant");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await createRegistration({
        eventId: formEventId,
        teamName: formTeamName,
        participantIds: selectedParticipantIds,
        status: formStatus,
      });

      if (!res.success) {
        setError(res.error || "Failed to create registration");
      } else {
        setIsCreateOpen(false);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    regId: string,
    newStatus: RegistrationStatus
  ) {
    try {
      await updateRegistrationStatus(regId, newStatus);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await deleteRegistration(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      const matchSearch =
        search === "" ||
        r.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
        (r.teamName && r.teamName.toLowerCase().includes(search.toLowerCase())) ||
        r.participants.some(
          (p) =>
            p.participant.name.toLowerCase().includes(search.toLowerCase()) ||
            p.participant.participantId.toLowerCase().includes(search.toLowerCase())
        );

      const matchEvent = selectedEvent === "ALL" || r.eventId === selectedEvent;
      const matchStatus = selectedStatus === "ALL" || r.status === selectedStatus;

      return matchSearch && matchEvent && matchStatus;
    });
  }, [registrations, search, selectedEvent, selectedStatus]);

  return (
    <div className="space-y-6">
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by reg number, team, or participant name..."
        filters={[
          {
            id: "event",
            label: "Event",
            value: selectedEvent,
            options: [
              { label: "All Events", value: "ALL" },
              ...events.map((e) => ({ label: `${e.code} - ${e.name}`, value: e.id })),
            ],
            onChange: setSelectedEvent,
          },
          {
            id: "status",
            label: "Status",
            value: selectedStatus,
            options: [
              { label: "All Statuses", value: "ALL" },
              ...REGISTRATION_STATUSES.map((s) => ({ label: s, value: s })),
            ],
            onChange: setSelectedStatus,
          },
        ]}
      >
        <Button onClick={openCreate} size="sm" className="gap-1.5 whitespace-nowrap">
          <PlusCircle className="w-4 h-4" />
          <span>New Registration</span>
        </Button>
      </SearchFilterBar>

      {filteredRegistrations.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-6 h-6 text-zinc-500" />}
          title="No registrations found"
          description={
            search || selectedEvent !== "ALL" || selectedStatus !== "ALL"
              ? "Try adjusting your filters or search term."
              : "Register participants or teams for festival events."
          }
          actionLabel="New Registration"
          onAction={openCreate}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Reg Number</TableHeader>
                    <TableHeader>Event</TableHeader>
                    <TableHeader>Participants / Team</TableHeader>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader className="text-right">Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRegistrations.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-white">
                          {r.registrationNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="font-semibold text-white text-xs">
                            {r.event.name}
                          </span>
                          <div>
                            <Badge variant="primary" className="text-[10px]">
                              {r.event.code}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {r.teamName && (
                            <p className="text-xs font-bold text-red-400">
                              Team: {r.teamName}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {r.participants.map((p) => (
                              <span
                                key={p.participant.id}
                                className="text-xs text-zinc-300 bg-[#1e1c1d] px-2 py-0.5 rounded-md border border-[#2e2a2b]"
                              >
                                {p.participant.name}
                                {p.participant.house && (
                                  <span className="text-zinc-500 ml-1">
                                    ({p.participant.house.name})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-zinc-400">
                          {formatDate(r.registeredAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <select
                          value={r.status}
                          onChange={(e) =>
                            handleStatusChange(
                              r.id,
                              e.target.value as RegistrationStatus
                            )
                          }
                          aria-label="Change registration status"
                          className="rounded-lg border border-[#383334] bg-[#1a1819] px-2 py-1 text-xs text-white outline-none focus:border-[#931827] cursor-pointer"
                        >
                          {REGISTRATION_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteTarget(r)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredRegistrations.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-[#2d292a] bg-[#141314] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-[#931827] font-bold">
                      {r.registrationNumber}
                    </span>
                    <h3 className="font-semibold text-white text-sm">
                      {r.event.name} ({r.event.code})
                    </h3>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="space-y-1 text-xs text-zinc-300 pt-2 border-t border-[#232021]">
                  {r.teamName && (
                    <p className="font-bold text-red-400">Team: {r.teamName}</p>
                  )}
                  <p className="text-zinc-400">
                    Participants:{" "}
                    {r.participants.map((p) => p.participant.name).join(", ")}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#232021]">
                  <select
                    value={r.status}
                    onChange={(e) =>
                      handleStatusChange(
                        r.id,
                        e.target.value as RegistrationStatus
                      )
                    }
                    aria-label="Change registration status"
                    className="rounded-lg border border-[#383334] bg-[#1a1819] px-2 py-1 text-xs text-white outline-none focus:border-[#931827]"
                  >
                    {REGISTRATION_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(r)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create Registration Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Event Registration"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          <Select
            label="Target Event"
            value={formEventId}
            onChange={(e) => setFormEventId(e.target.value)}
            required
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} - {e.name} (Max: {e.maxParticipants || 1})
              </option>
            ))}
          </Select>

          <Input
            label="Team Name (Optional for Solo)"
            value={formTeamName}
            onChange={(e) => setFormTeamName(e.target.value)}
            placeholder="e.g. CyberKnights or leave blank for individual"
          />

          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Select Registered Participants ({selectedParticipantIds.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-[#2d292a] bg-[#0c0b0c] p-3 divide-y divide-[#1f1c1d]">
              {participants.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-2">
                  No participants available. Add participants first.
                </p>
              ) : (
                participants.map((p) => {
                  const isSelected = selectedParticipantIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleParticipantSelection(p.id)}
                      className={`py-2 px-2 flex items-center justify-between cursor-pointer rounded-lg transition ${
                        isSelected ? "bg-[#251517] text-white" : "hover:bg-[#181617]"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold">{p.name}</p>
                        <p className="text-[10px] text-zinc-400">
                          {p.participantId} {p.houseName ? `• House ${p.houseName}` : ""}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        aria-label={`Select ${p.name}`}
                        className="rounded border-[#383334] text-[#931827] focus:ring-[#931827]"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292526]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              Create Registration
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Registration"
        message={`Are you sure you want to delete registration ${deleteTarget?.registrationNumber}?`}
        confirmLabel="Delete Registration"
        isLoading={loading}
      />
    </div>
  );
}
