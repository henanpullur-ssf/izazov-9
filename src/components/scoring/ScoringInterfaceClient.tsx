"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Lock,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { submitScore, lockScores } from "@/actions/scoring";
import { ScoreStatus } from "@prisma/client";

export interface ScoringEvent {
  id: string;
  code: string;
  name: string;
  judges: {
    judge: {
      id: string;
      user: { name: string; email: string };
    };
  }[];
  registrations: {
    id: string;
    registrationNumber: string;
    teamName: string | null;
    participants: {
      participant: {
        id: string;
        name: string;
        house: { name: string } | null;
      };
    }[];
  }[];
}

export interface ExistingScore {
  id: string;
  eventId: string;
  registrationId: string;
  judgeId: string;
  marks: number;
  maxMarks: number;
  remarks: string | null;
  status: ScoreStatus;
}

export function ScoringInterfaceClient({
  events,
  initialScores,
  allJudges,
}: {
  events: ScoringEvent[];
  initialScores: ExistingScore[];
  allJudges: { id: string; user: { name: string } }[];
}) {
  const router = useRouter();

  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "");
  const [selectedJudgeId, setSelectedJudgeId] = useState(
    events[0]?.judges[0]?.judge?.id || allJudges[0]?.id || ""
  );

  const [userInputs, setUserInputs] = useState<
    Record<string, { marks?: string; maxMarks?: string; remarks?: string }>
  >({});
  const [savingRegId, setSavingRegId] = useState<string | null>(null);
  const [lockLoading, setLockLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentEvent = events.find((e) => e.id === selectedEventId);

  function getEntryScore(regId: string) {
    const existing = initialScores.find(
      (s) =>
        s.eventId === selectedEventId &&
        s.registrationId === regId &&
        s.judgeId === selectedJudgeId
    );

    const override = userInputs[regId];

    return {
      marks: override?.marks !== undefined ? override.marks : (existing ? String(existing.marks) : ""),
      maxMarks: override?.maxMarks !== undefined ? override.maxMarks : (existing ? String(existing.maxMarks) : "100"),
      remarks: override?.remarks !== undefined ? override.remarks : (existing?.remarks || ""),
      status: existing?.status || ScoreStatus.DRAFT,
    };
  }

  function handleInputChange(
    regId: string,
    field: "marks" | "maxMarks" | "remarks",
    value: string
  ) {
    setUserInputs((prev) => ({
      ...prev,
      [regId]: {
        ...prev[regId],
        [field]: value,
      },
    }));
  }

  async function handleSaveScore(regId: string, targetStatus: ScoreStatus) {
    if (!selectedEventId || !selectedJudgeId) {
      setMessage({ type: "error", text: "Please select an event and judge" });
      return;
    }

    const regScore = getEntryScore(regId);
    if (regScore.marks === "") {
      setMessage({ type: "error", text: "Please enter marks before submitting" });
      return;
    }

    setSavingRegId(regId);
    setMessage(null);

    try {
      const res = await submitScore({
        eventId: selectedEventId,
        registrationId: regId,
        judgeId: selectedJudgeId,
        marks: parseFloat(regScore.marks),
        maxMarks: regScore.maxMarks ? parseFloat(regScore.maxMarks) : 100,
        remarks: regScore.remarks,
        status: targetStatus,
      });

      if (!res.success) {
        setMessage({ type: "error", text: res.error || "Failed to save score" });
      } else {
        setMessage({
          type: "success",
          text: `Score saved for entry (${targetStatus})`,
        });
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Network error saving score" });
    } finally {
      setSavingRegId(null);
    }
  }

  async function handleLockAll() {
    if (!selectedEventId) return;
    setLockLoading(true);
    try {
      await lockScores(selectedEventId);
      setMessage({
        type: "success",
        text: "All scores for this event have been locked",
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLockLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Event and Judge Selection Bar */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="1. Select Competition Event"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.code} - {evt.name} ({evt.registrations.length} entries)
              </option>
            ))}
          </Select>

          <Select
            label="2. Evaluating Judge"
            value={selectedJudgeId}
            onChange={(e) => setSelectedJudgeId(e.target.value)}
          >
            {allJudges.map((j) => (
              <option key={j.id} value={j.id}>
                Judge: {j.user.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {message && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-red-950/40 border-red-800 text-red-300"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-current opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {!currentEvent || currentEvent.registrations.length === 0 ? (
        <EmptyState
          icon={<Award className="w-6 h-6 text-zinc-500" />}
          title="No registered participants for this event"
          description="Participants must be registered before scores can be entered."
          actionLabel="Go to Registrations"
          actionHref="/admin/registrations"
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Score Entry Form ({currentEvent.registrations.length} Participants/Teams)
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLockAll}
              isLoading={lockLoading}
              className="text-xs gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock All Scores
            </Button>
          </div>

          <div className="space-y-4">
            {currentEvent.registrations.map((reg, index) => {
              const score = getEntryScore(reg.id);
              const isLocked = score.status === ScoreStatus.LOCKED;

              return (
                <Card
                  key={reg.id}
                  className={`p-4 sm:p-5 transition ${
                    score.status === ScoreStatus.SUBMITTED
                      ? "border-emerald-800/40 bg-[#121714]"
                      : isLocked
                      ? "border-zinc-700/40 opacity-80"
                      : "hover:border-[#383334]"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Participant Details */}
                    <div className="space-y-1 lg:w-1/3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-400">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-white text-sm">
                          {reg.teamName || reg.participants[0]?.participant?.name || "Participant"}
                        </span>
                        <StatusBadge status={score.status} />
                      </div>
                      <p className="text-xs text-zinc-400">
                        Reg No: {reg.registrationNumber}
                      </p>
                      <div className="flex flex-wrap gap-1 text-[11px] text-zinc-400">
                        {reg.participants.map((p) => (
                          <span key={p.participant.id}>
                            {p.participant.name}
                            {p.participant.house && ` (${p.participant.house.name})`}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Input
                          label="Score / Marks"
                          type="number"
                          step="0.5"
                          min="0"
                          max={score.maxMarks || "100"}
                          value={score.marks}
                          onChange={(e) =>
                            handleInputChange(reg.id, "marks", e.target.value)
                          }
                          placeholder="e.g. 88.5"
                          disabled={isLocked}
                          className="font-mono font-bold text-base"
                        />
                      </div>

                      <div>
                        <Input
                          label="Max Marks"
                          type="number"
                          value={score.maxMarks}
                          onChange={(e) =>
                            handleInputChange(reg.id, "maxMarks", e.target.value)
                          }
                          placeholder="100"
                          disabled={isLocked}
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <Input
                          label="Judge Remarks"
                          value={score.remarks}
                          onChange={(e) =>
                            handleInputChange(reg.id, "remarks", e.target.value)
                          }
                          placeholder="Feedback..."
                          disabled={isLocked}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    {!isLocked && (
                      <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#232021]">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleSaveScore(reg.id, ScoreStatus.DRAFT)
                          }
                          isLoading={savingRegId === reg.id}
                        >
                          <Save className="w-3.5 h-3.5 mr-1" />
                          Draft
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleSaveScore(reg.id, ScoreStatus.SUBMITTED)
                          }
                          isLoading={savingRegId === reg.id}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Submit
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
