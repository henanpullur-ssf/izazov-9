"use client";

import React, { useState, useMemo, useTransition } from "react";
import { Users, Search, CheckCircle2, Clock, Loader2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  getEventRegisteredParticipants,
  manualCheckIn,
} from "@/actions/attendance";
import { formatTime } from "@/lib/constants";

type EventOption = { id: string; name: string; code: string };

type RosterEntry = {
  id: string;
  participantId: string;
  name: string;
  houseName: string | null;
  attendanceStatus: string | null;
  scannedAt: Date | null;
};

type FeedbackMsg = { type: "success" | "error" | "info"; text: string };

export function ManualCheckInSection({ events }: { events: EventOption[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events[0]?.id ?? ""
  );
  const [roster, setRoster] = useState<RosterEntry[] | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  // Per-row check-in state: maps participantId → { loading, feedback }
  const [checkInState, setCheckInState] = useState<
    Record<string, { loading: boolean; feedback: FeedbackMsg | null }>
  >({});

  const [, startTransition] = useTransition();

  async function loadRoster(eventId: string) {
    if (!eventId) return;
    setRosterLoading(true);
    setRosterError(null);
    setRoster(null);
    setSearch("");
    setCheckInState({});

    const res = await getEventRegisteredParticipants(eventId);
    setRosterLoading(false);

    if (!res.success || !res.data) {
      setRosterError(res.error ?? "Failed to load roster.");
      return;
    }

    // Normalize scannedAt: server actions can serialize Date as string over the wire
    const normalized = res.data.map((p) => ({
      ...p,
      scannedAt: p.scannedAt ? new Date(p.scannedAt) : null,
    }));
    setRoster(normalized);
  }

  function handleEventChange(eventId: string) {
    setSelectedEventId(eventId);
    loadRoster(eventId);
  }

  const filteredRoster = useMemo(() => {
    if (!roster) return [];
    const q = search.toLowerCase().trim();
    if (!q) return roster;
    return roster.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.participantId.toLowerCase().includes(q)
    );
  }, [roster, search]);

  async function handleCheckIn(participant: RosterEntry) {
    const pid = participant.id;

    setCheckInState((prev) => ({
      ...prev,
      [pid]: { loading: true, feedback: null },
    }));

    const res = await manualCheckIn({
      participantId: pid,
      eventId: selectedEventId,
    });

    let feedback: FeedbackMsg;

    if (!res.success) {
      feedback = { type: "error", text: res.error ?? "Check-in failed." };
      setCheckInState((prev) => ({
        ...prev,
        [pid]: { loading: false, feedback },
      }));
      return;
    }

    if (res.alreadyPresent) {
      feedback = { type: "info", text: "Already marked as present." };
      setCheckInState((prev) => ({
        ...prev,
        [pid]: { loading: false, feedback },
      }));
      // Also update local roster state so button shows "Already Present"
      setRoster((prev) =>
        prev
          ? prev.map((p) =>
              p.id === pid
                ? { ...p, attendanceStatus: "PRESENT", scannedAt: p.scannedAt }
                : p
            )
          : prev
      );
      return;
    }

    // Success — mark as PRESENT in local roster immediately
    feedback = { type: "success", text: `${participant.name} checked in!` };
    startTransition(() => {
      setRoster((prev) =>
        prev
          ? prev.map((p) =>
              p.id === pid
                ? { ...p, attendanceStatus: "PRESENT", scannedAt: new Date() }
                : p
            )
          : prev
      );
      setCheckInState((prev) => ({
        ...prev,
        [pid]: { loading: false, feedback },
      }));
    });
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <Card className="border-[var(--border-subtle)] bg-[var(--surface)]">
      <CardHeader className="py-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[var(--brand)]" />
          <CardTitle className="text-base">Manual Individual Check-in</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Event selector + load button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            aria-label="Select Event for Manual Check-in"
            className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3.5 py-2.5 text-xs text-[var(--foreground)] outline-none focus:border-[var(--brand)]"
          >
            {events.length === 0 && (
              <option value="">No events available</option>
            )}
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} — {e.name}
              </option>
            ))}
          </select>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            isLoading={rosterLoading}
            disabled={!selectedEventId || rosterLoading}
            onClick={() => handleEventChange(selectedEventId)}
            className="shrink-0"
          >
            <Users className="w-4 h-4 mr-1.5" />
            Load Roster
          </Button>
        </div>

        {/* Error state */}
        {rosterError && (
          <div className="p-3 rounded-xl border border-red-800 bg-red-950/40 text-xs text-red-300">
            {rosterError}
          </div>
        )}

        {/* Roster loaded */}
        {roster !== null && !rosterLoading && (
          <div className="space-y-3">
            {/* Stats + Search bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] shrink-0">
                <span>
                  {selectedEvent?.code} —{" "}
                  <span className="text-[var(--foreground)] font-semibold">
                    {roster.length}
                  </span>{" "}
                  registered
                  {roster.filter((p) => p.attendanceStatus === "PRESENT")
                    .length > 0 && (
                    <span className="ml-1 text-emerald-400">
                      (
                      {
                        roster.filter((p) => p.attendanceStatus === "PRESENT")
                          .length
                      }{" "}
                      present)
                    </span>
                  )}
                </span>
              </div>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-dim)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or participant ID…"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] pl-9 pr-3 py-1.5 text-xs text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none focus:border-[var(--brand)]"
                />
              </div>
            </div>

            {/* Empty state: no registrations */}
            {roster.length === 0 && (
              <div className="py-8 text-center text-xs text-[var(--text-dim)]">
                <Users className="w-8 h-8 mx-auto mb-2 text-[var(--text-dim)]" />
                No participants are registered for this event.
              </div>
            )}

            {/* Empty state: search no results */}
            {roster.length > 0 && filteredRoster.length === 0 && (
              <div className="py-6 text-center text-xs text-[var(--text-dim)]">
                No participants match your search.
              </div>
            )}

            {/* Participant rows */}
            {filteredRoster.length > 0 && (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {filteredRoster.map((participant) => {
                  const state = checkInState[participant.id];
                  const isLoading = state?.loading ?? false;
                  const feedback = state?.feedback ?? null;
                  const isPresent =
                    participant.attendanceStatus === "PRESENT";

                  return (
                    <div
                      key={participant.id}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-colors ${
                        isPresent
                          ? "border-emerald-800/50 bg-emerald-950/20"
                          : "border-[var(--border-subtle)] bg-[var(--surface-card)]"
                      }`}
                    >
                      {/* Participant info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[var(--foreground)] truncate">
                          {participant.name}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {participant.participantId}
                          {participant.houseName &&
                            ` • ${participant.houseName}`}
                          {isPresent && participant.scannedAt && (
                            <span className="ml-1 text-emerald-500">
                              • checked in at {formatTime(participant.scannedAt)}
                            </span>
                          )}
                        </p>

                        {/* Per-row feedback */}
                        {feedback && (
                          <p
                            className={`text-[10px] mt-0.5 ${
                              feedback.type === "success"
                                ? "text-emerald-400"
                                : feedback.type === "info"
                                ? "text-sky-400"
                                : "text-red-400"
                            }`}
                          >
                            {feedback.text}
                          </p>
                        )}
                      </div>

                      {/* Action / status */}
                      <div className="shrink-0">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 rounded-lg px-2.5 py-1.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Present
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            disabled={isLoading}
                            onClick={() => handleCheckIn(participant)}
                            className="text-[11px] px-3 py-1.5 h-auto"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Checking in…
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Check In
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Idle state hint */}
        {roster === null && !rosterLoading && !rosterError && (
          <p className="text-xs text-[var(--text-dim)] text-center py-4">
            Select an event and click <span className="text-[var(--text-muted)]">Load Roster</span> to see registered participants.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
