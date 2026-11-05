"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  PlusCircle,
  Trash2,
  Pencil,
  Users,
  Search,
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
  updateRegistration,
} from "@/actions/registrations";

import { formatDate, REGISTRATION_STATUSES, RegistrationStatus } from "@/lib/constants";

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
  /** Judging-data protection: participant changes are locked when non-empty. */
  scores: { id: string }[];
  /** Judging-data protection: participant changes are locked when non-empty. */
  results: { id: string }[];
}

export function RegistrationManagementClient({
  registrations,
  events = [],
  participants = [],
  registrationCountByEvent = {},
}: {
  registrations: RegistrationItem[];
  events: { id: string; name: string; code: string; maxParticipants: number | null }[];
  participants: { id: string; name: string; participantId: string; houseName?: string }[];
  /** Per-event registration count derived server-side. Used for slot display (Req C). */
  registrationCountByEvent?: Record<string, number>;
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal visibility
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RegistrationItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RegistrationItem | null>(null);

  // Create form state
  const [formEventId, setFormEventId] = useState(events[0]?.id || "");
  const [formTeamName, setFormTeamName] = useState("");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<RegistrationStatus>(RegistrationStatus.CONFIRMED);
  const [participantSearch, setParticipantSearch] = useState("");

  // Edit form state
  const [editTeamName, setEditTeamName] = useState("");
  const [editSelectedParticipantIds, setEditSelectedParticipantIds] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<RegistrationStatus>(RegistrationStatus.CONFIRMED);
  const [editParticipantSearch, setEditParticipantSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");

  // --- Derived values ---

  // Req C: registration slot counter for the currently selected event
  const createEventData = useMemo(
    () => events.find((e) => e.id === formEventId) ?? null,
    [events, formEventId]
  );
  const createEventRegCount = formEventId ? (registrationCountByEvent[formEventId] ?? 0) : 0;
  const createEventAtCap = createEventRegCount >= 3;

  // Req A: participant list filtered by create-modal search
  const createFilteredParticipants = useMemo(() => {
    const q = participantSearch.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.participantId.toLowerCase().includes(q) ||
        (p.houseName && p.houseName.toLowerCase().includes(q))
    );
  }, [participants, participantSearch]);

  // Req D: event data and judging lock for edit modal
  const editEventData = useMemo(
    () => (editTarget ? events.find((e) => e.id === editTarget.eventId) ?? null : null),
    [events, editTarget]
  );
  const editHasJudgingData = useMemo(
    () =>
      editTarget
        ? editTarget.scores.length > 0 || editTarget.results.length > 0
        : false,
    [editTarget]
  );

  // Req A: participant list filtered by edit-modal search
  const editFilteredParticipants = useMemo(() => {
    const q = editParticipantSearch.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.participantId.toLowerCase().includes(q) ||
        (p.houseName && p.houseName.toLowerCase().includes(q))
    );
  }, [participants, editParticipantSearch]);

  function openCreate() {
    setFormEventId(events[0]?.id || "");
    setFormTeamName("");
    setSelectedParticipantIds([]);
    setFormStatus(RegistrationStatus.CONFIRMED);
    setParticipantSearch("");
    setError("");
    setIsCreateOpen(true);
  }

  function openEdit(r: RegistrationItem) {
    setEditTarget(r);
    setEditTeamName(r.teamName ?? "");
    setEditSelectedParticipantIds(r.participants.map((p) => p.participant.id));
    setEditStatus(r.status);
    setEditParticipantSearch("");
    setEditError("");
    setIsEditOpen(true);
  }

  function closeEdit() {
    setIsEditOpen(false);
    setEditTarget(null);
  }

  /** Reset participant selections when the event changes (limits may differ). */
  function handleFormEventChange(newEventId: string) {
    setFormEventId(newEventId);
    setSelectedParticipantIds([]);
  }

  /** Req B: enforce maxParticipants in Create modal. */
  function toggleParticipantSelection(id: string) {
    if (selectedParticipantIds.includes(id)) {
      setSelectedParticipantIds((prev) => prev.filter((p) => p !== id));
      return;
    }
    const cap = createEventData?.maxParticipants;
    if (cap != null && selectedParticipantIds.length >= cap) return; // at limit
    setSelectedParticipantIds((prev) => [...prev, id]);
  }

  /** Req B: enforce maxParticipants in Edit modal. */
  function toggleEditParticipantSelection(id: string) {
    if (editSelectedParticipantIds.includes(id)) {
      setEditSelectedParticipantIds((prev) => prev.filter((p) => p !== id));
      return;
    }
    const cap = editEventData?.maxParticipants;
    if (cap != null && editSelectedParticipantIds.length >= cap) return;
    setEditSelectedParticipantIds((prev) => [...prev, id]);
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

  /** Req D: update existing registration in place (preserves id, registrationNumber, registeredAt, scores, results). */
  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    if (editSelectedParticipantIds.length === 0) {
      setEditError("Please select at least one participant");
      return;
    }
    setLoading(true);
    setEditError("");
    try {
      const res = await updateRegistration(editTarget.id, {
        teamName: editTeamName,
        participantIds: editSelectedParticipantIds,
        status: editStatus,
      });
      if (!res.success) {
        setEditError(res.error || "Failed to update registration");
      } else {
        closeEdit();
        router.refresh();
      }
    } catch {
      setEditError("An unexpected error occurred");
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
          icon={<ClipboardList className="w-6 h-6 text-[var(--text-dim)]" />}
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
                          <span className="font-semibold text-[var(--foreground)] text-xs">
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
                                className="text-xs text-[var(--text-muted)] bg-[#1e1c1d] px-2 py-0.5 rounded-md border border-[var(--border-subtle)]"
                              >
                                {p.participant.name}
                                {p.participant.house && (
                                  <span className="text-[var(--text-dim)] ml-1">
                                    ({p.participant.house.name})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[var(--text-muted)]">
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
                          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1 text-xs text-white outline-none focus:border-[#931827] cursor-pointer"
                        >
                          {REGISTRATION_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(r)}
                            aria-label={`Edit registration ${r.registrationNumber}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(r)}
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
            {filteredRegistrations.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[#141314] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-[var(--brand)] font-bold">
                      {r.registrationNumber}
                    </span>
                    <h3 className="font-semibold text-white text-sm">
                      {r.event.name} ({r.event.code})
                    </h3>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="space-y-1 text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
                  {r.teamName && (
                    <p className="font-bold text-red-400">Team: {r.teamName}</p>
                  )}
                  <p className="text-[var(--text-muted)]">
                    Participants:{" "}
                    {r.participants.map((p) => p.participant.name).join(", ")}
                  </p>
                </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
                    <select
                      value={r.status}
                      onChange={(e) =>
                        handleStatusChange(
                          r.id,
                          e.target.value as RegistrationStatus
                        )
                      }
                      aria-label="Change registration status"
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1 text-xs text-white outline-none focus:border-[#931827]"
                    >
                      {REGISTRATION_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(r)}
                        aria-label={`Edit registration ${r.registrationNumber}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(r)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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

          {/* Event selector — uses handleFormEventChange to reset participant selections */}
          <Select
            label="Target Event"
            value={formEventId}
            onChange={(e) => handleFormEventChange(e.target.value)}
            required
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} - {e.name}
                {e.maxParticipants != null ? ` (Max ${e.maxParticipants} per reg)` : ""}
              </option>
            ))}
          </Select>

          {/* Req C: registration slot indicator */}
          {formEventId && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${
                createEventAtCap
                  ? "bg-red-950/40 border-red-800 text-red-300"
                  : "bg-emerald-950/30 border-emerald-900 text-emerald-400"
              }`}
            >
              <span className="font-semibold">{createEventRegCount} / 3 registrations</span>
              <span className="opacity-70">
                {createEventAtCap ? "— no slots remaining" : "used for this event"}
              </span>
            </div>
          )}

          {createEventAtCap ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 text-center">
              This event already has 3 registrations and cannot accept any more.
              Select a different event.
            </div>
          ) : (
            <>
              <Input
                label="Team Name (Optional for Solo)"
                value={formTeamName}
                onChange={(e) => setFormTeamName(e.target.value)}
                placeholder="e.g. CyberKnights or leave blank for individual"
              />

              {/* Req A + B: participant picker with search and limit display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Select Participants
                  </label>
                  {/* Req B: X / Y counter */}
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                      createEventData?.maxParticipants != null &&
                      selectedParticipantIds.length >= createEventData.maxParticipants
                        ? "bg-red-950/50 text-red-300 border-red-800"
                        : "bg-[#1e1c1d] text-[var(--text-muted)] border-[var(--border-subtle)]"
                    }`}
                  >
                    {selectedParticipantIds.length}
                    {createEventData?.maxParticipants != null
                      ? ` / ${createEventData.maxParticipants}`
                      : ""}{" "}
                    selected
                  </span>
                </div>

                {/* Req B: limit-reached warning */}
                {createEventData?.maxParticipants != null &&
                  selectedParticipantIds.length >= createEventData.maxParticipants && (
                    <p className="text-xs text-amber-400 bg-amber-950/30 border border-amber-800/50 rounded-lg px-3 py-2">
                      Participant limit reached ({createEventData.maxParticipants} max). Deselect a
                      participant to choose a different one.
                    </p>
                  )}

                {/* Req A: participant search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-dim)] pointer-events-none" />
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Search by name, ID, or house..."
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#931827] focus:ring-1 focus:ring-[#931827]/30 transition"
                    aria-label="Search participants"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3 divide-y divide-[#1f1c1d]">
                  {participants.length === 0 ? (
                    <p className="text-xs text-[var(--text-dim)] text-center py-2">
                      No participants available. Add participants first.
                    </p>
                  ) : createFilteredParticipants.length === 0 ? (
                    <p className="text-xs text-[var(--text-dim)] text-center py-4">
                      No participants match &ldquo;{participantSearch}&rdquo;
                    </p>
                  ) : (
                    createFilteredParticipants.map((p) => {
                      const isSelected = selectedParticipantIds.includes(p.id);
                      const isAtLimit =
                        !isSelected &&
                        createEventData?.maxParticipants != null &&
                        selectedParticipantIds.length >= createEventData.maxParticipants;
                      const disabled = isAtLimit;
                      return (
                        <div
                          key={p.id}
                          onClick={disabled ? undefined : () => toggleParticipantSelection(p.id)}
                          title={
                            isAtLimit
                              ? `Participant limit of ${createEventData?.maxParticipants} reached`
                              : undefined
                          }
                          className={`py-2 px-2 flex items-center justify-between rounded-lg transition ${
                            isSelected
                              ? "bg-[var(--surface-card)] text-white cursor-pointer"
                              : disabled
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:bg-[var(--surface-hover)] cursor-pointer"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-semibold">{p.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)]">
                              {p.participantId}
                              {p.houseName ? ` • ${p.houseName}` : ""}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            disabled={disabled}
                            aria-label={`Select ${p.name}`}
                            className="rounded border-[var(--border-subtle)] text-[var(--brand)] focus:ring-[#931827] disabled:opacity-50"
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <Select
                label="Initial Status"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as RegistrationStatus)}
              >
                {REGISTRATION_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Select>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading} disabled={createEventAtCap}>
              Create Registration
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Registration Modal — Req D */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeEdit}
        title="Edit Registration"
        maxWidth="lg"
      >
        {editTarget && (
          <form onSubmit={handleEdit} className="space-y-4">
            {/* Read-only identity banner */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)]">
              <span className="text-xs text-[var(--text-dim)] uppercase tracking-wider">Reg #</span>
              <span className="font-mono text-xs font-bold text-[var(--brand)]">
                {editTarget.registrationNumber}
              </span>
              <span className="text-[var(--text-dim)]">·</span>
              <span className="text-xs text-[var(--text-muted)]">
                {editTarget.event.code} — {editTarget.event.name}
              </span>
              <span className="text-[var(--text-dim)]">·</span>
              <span className="text-xs text-[var(--text-dim)]">
                Registered {formatDate(editTarget.registeredAt)}
              </span>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
                {editError}
              </div>
            )}

            <Input
              label="Team Name (Optional for Solo)"
              value={editTeamName}
              onChange={(e) => setEditTeamName(e.target.value)}
              placeholder="e.g. CyberKnights or leave blank for individual"
            />

            <Select
              label="Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as RegistrationStatus)}
            >
              {REGISTRATION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </Select>

            {/* Participants section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Participants
                </label>
                {/* Req B: X / Y counter */}
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                    editEventData?.maxParticipants != null &&
                    editSelectedParticipantIds.length >= editEventData.maxParticipants
                      ? "bg-red-950/50 text-red-300 border-red-800"
                      : "bg-[#1e1c1d] text-[var(--text-muted)] border-[var(--border-subtle)]"
                  }`}
                >
                  {editSelectedParticipantIds.length}
                  {editEventData?.maxParticipants != null
                    ? ` / ${editEventData.maxParticipants}`
                    : ""}{" "}
                  selected
                </span>
              </div>

              {/* Judging-data protection notice */}
              {editHasJudgingData && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-300">
                  <Users className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Participants cannot be changed — this registration has existing scores or
                    results. Team name and status can still be updated.
                  </span>
                </div>
              )}

              {!editHasJudgingData && (
                <>
                  {/* Req B: limit-reached warning */}
                  {editEventData?.maxParticipants != null &&
                    editSelectedParticipantIds.length >= editEventData.maxParticipants && (
                      <p className="text-xs text-amber-400 bg-amber-950/30 border border-amber-800/50 rounded-lg px-3 py-2">
                        Participant limit reached ({editEventData.maxParticipants} max). Deselect a
                        participant to choose a different one.
                      </p>
                    )}

                  {/* Req A: participant search for edit */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-dim)] pointer-events-none" />
                    <input
                      type="text"
                      value={editParticipantSearch}
                      onChange={(e) => setEditParticipantSearch(e.target.value)}
                      placeholder="Search by name, ID, or house..."
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#931827] focus:ring-1 focus:ring-[#931827]/30 transition"
                      aria-label="Search participants"
                    />
                  </div>
                </>
              )}

              <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3 divide-y divide-[#1f1c1d]">
                {editHasJudgingData ? (
                  // Read-only participant list when judging data exists
                  editTarget.participants.map((p) => (
                    <div
                      key={p.participant.id}
                      className="py-2 px-2 flex items-center justify-between rounded-lg bg-[var(--surface-card)] text-white"
                    >
                      <div>
                        <p className="text-xs font-semibold">{p.participant.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {p.participant.participantId}
                          {p.participant.house ? ` • ${p.participant.house.name}` : ""}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        disabled
                        className="rounded border-[var(--border-subtle)] text-[var(--brand)] opacity-50"
                      />
                    </div>
                  ))
                ) : participants.length === 0 ? (
                  <p className="text-xs text-[var(--text-dim)] text-center py-2">
                    No participants available.
                  </p>
                ) : editFilteredParticipants.length === 0 ? (
                  <p className="text-xs text-[var(--text-dim)] text-center py-4">
                    No participants match &ldquo;{editParticipantSearch}&rdquo;
                  </p>
                ) : (
                  editFilteredParticipants.map((p) => {
                    const isSelected = editSelectedParticipantIds.includes(p.id);
                    const isAtLimit =
                      !isSelected &&
                      editEventData?.maxParticipants != null &&
                      editSelectedParticipantIds.length >= editEventData.maxParticipants;
                    const disabled = isAtLimit;
                    return (
                      <div
                        key={p.id}
                        onClick={disabled ? undefined : () => toggleEditParticipantSelection(p.id)}
                        title={
                          isAtLimit
                            ? `Participant limit of ${editEventData?.maxParticipants} reached`
                            : undefined
                        }
                        className={`py-2 px-2 flex items-center justify-between rounded-lg transition ${
                          isSelected
                            ? "bg-[var(--surface-card)] text-white cursor-pointer"
                            : disabled
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-[var(--surface-hover)] cursor-pointer"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold">{p.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">
                            {p.participantId}
                            {p.houseName ? ` • ${p.houseName}` : ""}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          disabled={disabled}
                          aria-label={`Select ${p.name}`}
                          className="rounded border-[var(--border-subtle)] text-[var(--brand)] focus:ring-[#931827] disabled:opacity-50"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeEdit}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
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
