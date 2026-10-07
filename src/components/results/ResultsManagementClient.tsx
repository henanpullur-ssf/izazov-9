"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { saveResult, deleteResult, toggleResultPublish } from "@/actions/results";
import { GRADE_OPTIONS, PRIZE_LEVELS } from "@/lib/constants";

export interface ResultItem {
  id: string;
  eventId: string;
  registrationId: string;
  participantId: string | null;
  position: number | null;
  points: number;
  totalMarks: number;
  grade: string | null;
  prizeLevel: string | null;
  remarks: string | null;
  isPublished: boolean;
  isWinner: boolean;
  event: {
    id: string;
    code: string;
    name: string;
    category: string | null;
  };
  participant: {
    id: string;
    name: string;
    participantId: string;
    rollNumber: string | null;
    house: { name: string } | null;
  } | null;
  registration: {
    id: string;
    registrationNumber: string;
    teamName: string | null;
    participants: {
      participant: {
        id: string;
        name: string;
        participantId: string;
        rollNumber: string | null;
        house: { name: string } | null;
      };
    }[];
  };
}

export interface EventOption {
  id: string;
  name: string;
  code: string;
  category: string | null;
  registrations: {
    id: string;
    registrationNumber: string;
    teamName: string | null;
    participants: {
      participant: {
        id: string;
        name: string;
        participantId: string;
        rollNumber: string | null;
        house: { name: string } | null;
      };
    }[];
  }[];
}

export function ResultsManagementClient({
  results,
  events = [],
}: {
  results: ResultItem[];
  events: EventOption[];
}) {
  const router = useRouter();

  const [selectedEventId, setSelectedEventId] = useState("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);

  // Result Form Fields
  const [formEventId, setFormEventId] = useState(events[0]?.id || "");
  const [formRegId, setFormRegId] = useState("");
  const [formParticipantId, setFormParticipantId] = useState("");
  const [position, setPosition] = useState<string>("1");
  const [points, setPoints] = useState<string>("");
  const [grade, setGrade] = useState<string>("A+");
  const [customGrade, setCustomGrade] = useState<string>("");
  const [prizeLevel, setPrizeLevel] = useState<string>("1st Prize");
  const [remarks, setRemarks] = useState<string>("");
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isWinner, setIsWinner] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ResultItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentFormEvent = events.find((e) => e.id === formEventId);
  const currentRegistration = currentFormEvent?.registrations.find((r) => r.id === formRegId);

  function resetForm() {
    setEditingResultId(null);
    setFormEventId(events[0]?.id || "");
    const initialReg = events[0]?.registrations[0];
    setFormRegId(initialReg?.id || "");
    setFormParticipantId(initialReg?.participants[0]?.participant?.id || "");
    setPosition("1");
    setPoints("");
    setGrade("A+");
    setCustomGrade("");
    setPrizeLevel("1st Prize");
    setRemarks("");
    setIsPublished(true);
    setIsWinner(true);
    setError("");
  }

  function openCreateModal() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditModal(res: ResultItem) {
    setEditingResultId(res.id);
    setFormEventId(res.eventId);
    setFormRegId(res.registrationId);
    setFormParticipantId(res.participantId || "");
    setPosition(res.position ? String(res.position) : "");
    setPoints(String(res.points));
    
    if (res.grade && (GRADE_OPTIONS as readonly string[]).includes(res.grade)) {
      setGrade(res.grade);
      setCustomGrade("");
    } else if (res.grade) {
      setGrade("Other");
      setCustomGrade(res.grade);
    } else {
      setGrade("");
      setCustomGrade("");
    }

    setPrizeLevel(res.prizeLevel || "No Prize");
    setRemarks(res.remarks || "");
    setIsPublished(res.isPublished);
    setIsWinner(res.isWinner);
    setError("");
    setIsFormOpen(true);
  }

  async function handleSaveResult(e: React.FormEvent) {
    e.preventDefault();
    if (!formEventId || !formRegId || points.trim() === "") {
      setError("Please select competition, registered entry, and enter manually awarded points.");
      return;
    }

    const numPoints = parseFloat(points);
    if (isNaN(numPoints)) {
      setError("Please enter a valid numeric points value.");
      return;
    }

    setLoading(true);
    setError("");

    const finalGrade = grade === "Other" ? customGrade.trim() : grade;
    const reg = currentFormEvent?.registrations.find((r) => r.id === formRegId);
    const resolvedParticipantId =
      formParticipantId || reg?.participants[0]?.participant?.id || undefined;

    try {
      const res = await saveResult({
        id: editingResultId || undefined,
        eventId: formEventId,
        registrationId: formRegId,
        participantId: resolvedParticipantId,
        position: position ? parseInt(position, 10) : undefined,
        points: numPoints,
        grade: finalGrade || undefined,
        prizeLevel: prizeLevel || undefined,
        remarks: remarks || undefined,
        isWinner,
        isPublished,
      });

      if (!res.success) {
        setError(res.error || "Failed to save result");
      } else {
        setIsFormOpen(false);
        resetForm();
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred while saving result.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePublish(res: ResultItem) {
    try {
      await toggleResultPublish(res.id, !res.isPublished);
      router.refresh();
    } catch (err) {
      console.error("Failed to toggle publish:", err);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteResult(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredResults = results.filter((r) => {
    return selectedEventId === "ALL" || r.eventId === selectedEventId;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131213] p-4 rounded-2xl border border-[#272425]">
        <div className="flex items-center gap-3">
          <label htmlFor="event-filter" className="text-xs text-zinc-400 font-medium whitespace-nowrap">
            Filter by Event:
          </label>
          <select
            id="event-filter"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            aria-label="Filter Results by Event"
            className="rounded-xl border border-[#2f2b2c] bg-[#0c0b0c] px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-[#931827] cursor-pointer max-w-sm"
          >
            <option value="ALL">All Competitions ({results.length} Results)</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} — {e.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={openCreateModal}
          size="sm"
          className="gap-1.5 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Enter / Publish Result</span>
        </Button>
      </div>

      {filteredResults.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-6 h-6 text-zinc-500" />}
          title="No results recorded"
          description="Enter official scores, grades, prize levels, and manually assigned points for completed competitions."
          actionLabel="Enter Result"
          onAction={openCreateModal}
        />
      ) : (
        <div className="space-y-3">
          {filteredResults.map((res) => {
            const participantName =
              res.registration.teamName ||
              res.participant?.name ||
              res.registration.participants[0]?.participant?.name ||
              "Participant";

            const teamName =
              res.participant?.house?.name ||
              res.registration.participants[0]?.participant?.house?.name ||
              null;

            const rollNo =
              res.participant?.rollNumber ||
              res.registration.participants[0]?.participant?.rollNumber ||
              null;

            const pId =
              res.participant?.participantId ||
              res.registration.participants[0]?.participant?.participantId ||
              res.registration.registrationNumber;

            return (
              <Card
                key={res.id}
                className={`p-4 sm:p-5 transition ${
                  !res.isPublished
                    ? "opacity-60 border-dashed border-[#383334]"
                    : res.position === 1 || res.prizeLevel === "1st Prize"
                    ? "border-amber-500/40 bg-gradient-to-r from-[#1c170f] via-[#141213] to-[#121112]"
                    : "hover:border-[#383334]"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Column: Rank Badge & Participant/Event Info */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                        res.position === 1 || res.prizeLevel === "1st Prize"
                          ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25 font-black"
                          : res.position === 2 || res.prizeLevel === "2nd Prize"
                          ? "bg-zinc-300 text-black font-bold"
                          : res.position === 3 || res.prizeLevel === "3rd Prize"
                          ? "bg-amber-800 text-white font-bold"
                          : "bg-[#201d1e] text-zinc-400 border border-[#383334]"
                      }`}
                    >
                      {res.position ? `#${res.position}` : "—"}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base">
                          {participantName}
                        </span>
                        {rollNo && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#201d1e] text-zinc-300 border border-[#332f30]">
                            Roll: {rollNo}
                          </span>
                        )}
                        <Badge variant="primary" className="text-[10px]">
                          {pId}
                        </Badge>
                        {teamName && (
                          <Badge variant="info" className="text-[10px]">
                            Team {teamName}
                          </Badge>
                        )}
                        {res.prizeLevel && res.prizeLevel !== "No Prize" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Trophy className="w-3 h-3" />
                            {res.prizeLevel}
                          </span>
                        )}
                        {res.grade && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                            Grade {res.grade}
                          </span>
                        )}
                        {res.isPublished ? (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-400">
                            Published
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            Unpublished
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 flex items-center gap-2 flex-wrap">
                        <span>
                          Event:{" "}
                          <strong className="text-zinc-200">
                            {res.event.name} ({res.event.code})
                          </strong>
                        </span>
                        {res.event.category && (
                          <span>• Category: {res.event.category}</span>
                        )}
                        {res.remarks && (
                          <span className="italic text-zinc-500">
                            • &ldquo;{res.remarks}&rdquo;
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Points & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-[#232021]">
                    <div className="text-left md:text-right">
                      <div className="flex items-baseline md:justify-end gap-1">
                        <span className="text-xl sm:text-2xl font-mono font-black text-white">
                          {res.points}
                        </span>
                        <span className="text-xs text-zinc-400 font-bold">pts</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                        Manual Fest Points
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleTogglePublish(res)}
                        title={res.isPublished ? "Unpublish Result" : "Publish Result"}
                      >
                        {res.isPublished ? (
                          <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditModal(res)}
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(res)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Result Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          resetForm();
        }}
        title={editingResultId ? "Edit Festival Result" : "Enter Official Festival Result"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveResult} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="1. Festival Competition"
              value={formEventId}
              onChange={(e) => {
                const evId = e.target.value;
                setFormEventId(evId);
                const ev = events.find((item) => item.id === evId);
                const firstReg = ev?.registrations[0];
                setFormRegId(firstReg?.id || "");
                setFormParticipantId(firstReg?.participants[0]?.participant?.id || "");
              }}
              required
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.code} — {e.name}
                </option>
              ))}
            </Select>

            <Select
              label="2. Registered Entry / Participant"
              value={formRegId}
              onChange={(e) => {
                const regId = e.target.value;
                setFormRegId(regId);
                const reg = currentFormEvent?.registrations.find((r) => r.id === regId);
                setFormParticipantId(reg?.participants[0]?.participant?.id || "");
              }}
              required
            >
              {currentFormEvent?.registrations && currentFormEvent.registrations.length > 0 ? (
                currentFormEvent.registrations.map((r) => {
                  const p = r.participants[0]?.participant;
                  const label =
                    r.teamName ||
                    (p ? `${p.name} (${p.rollNumber ? `Roll: ${p.rollNumber} • ` : ""}${p.participantId})` : r.registrationNumber);
                  return (
                    <option key={r.id} value={r.id}>
                      {r.registrationNumber} — {label}
                    </option>
                  );
                })
              ) : (
                <option value="">No registrations found for this event</option>
              )}
            </Select>
          </div>

          {/* Group member specific participant selection if multiple participants */}
          {currentRegistration && currentRegistration.participants.length > 1 && (
            <Select
              label="Specific Participant to Credit (Optional for group)"
              value={formParticipantId}
              onChange={(e) => setFormParticipantId(e.target.value)}
            >
              <option value="">All / Entire Registered Team</option>
              {currentRegistration.participants.map((rp) => (
                <option key={rp.participant.id} value={rp.participant.id}>
                  {rp.participant.name} ({rp.participant.participantId})
                </option>
              ))}
            </Select>
          )}

          {/* Points (Manual), Grade (Manual Selector), Prize Level */}
          <div className="p-4 rounded-2xl bg-[#0c0b0c] border border-[#2b2728] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Fest Points (Manual Entry)"
                  type="number"
                  step="any"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder="e.g. 10, 7, 5, 25..."
                  required
                  helperText="Exact event points entered manually"
                />
              </div>

              <div>
                <Select
                  label="Grade (Manual Selector)"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  <option value="">No Grade Awarded</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
                {grade === "Other" && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter custom grade..."
                      value={customGrade}
                      onChange={(e) => setCustomGrade(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <Select
                  label="Prize Level"
                  value={prizeLevel}
                  onChange={(e) => {
                    setPrizeLevel(e.target.value);
                    if (e.target.value === "1st Prize") {
                      setPosition("1");
                      setIsWinner(true);
                    } else if (e.target.value === "2nd Prize") {
                      setPosition("2");
                      setIsWinner(false);
                    } else if (e.target.value === "3rd Prize") {
                      setPosition("3");
                      setIsWinner(false);
                    }
                  }}
                >
                  {PRIZE_LEVELS.map((pl) => (
                    <option key={pl} value={pl}>
                      {pl}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Rank / Position (Optional)"
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value);
                  setIsWinner(e.target.value === "1");
                }}
              >
                <option value="">No Numeric Position</option>
                <option value="1">1st Place (1)</option>
                <option value="2">2nd Place (2)</option>
                <option value="3">3rd Place (3)</option>
                <option value="4">4th Place (4)</option>
                <option value="5">5th Place (5)</option>
                <option value="6">6th Place (6)</option>
              </Select>

              <Textarea
                label="Judge / Official Remarks (Optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Outstanding performance, clear articulation..."
                rows={1}
              />
            </div>
          </div>

          {/* Status Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#2b2728] bg-[#141213] cursor-pointer hover:border-[#403b3c] transition">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-[#383334] text-[#931827] focus:ring-[#931827] w-4 h-4"
              />
              <div>
                <p className="text-xs font-bold text-white">Published Status</p>
                <p className="text-[10px] text-zinc-400">
                  When enabled, counts towards totals and championship
                </p>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#2b2728] bg-[#141213] cursor-pointer hover:border-[#403b3c] transition">
              <input
                type="checkbox"
                checked={isWinner}
                onChange={(e) => setIsWinner(e.target.checked)}
                className="rounded border-[#383334] text-[#931827] focus:ring-[#931827] w-4 h-4"
              />
              <div>
                <p className="text-xs font-bold text-white">Highlight as Podium Winner</p>
                <p className="text-[10px] text-zinc-400">
                  Displays winner badge on leaderboard
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292526]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              {editingResultId ? "Update Result" : "Save & Publish Result"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Festival Result"
        message={`Are you sure you want to delete this result for "${deleteTarget?.event.name}"? This action will remove the awarded points (${deleteTarget?.points} pts) from the participant and team championship scoreboards.`}
        confirmLabel="Delete Result"
        isLoading={isDeleting}
      />
    </div>
  );
}
