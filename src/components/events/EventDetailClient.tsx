"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Users,
  Clock,
  Edit,
  Award,
  Trophy,
  ClipboardList,
} from "lucide-react";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { EventForm, VenueOption } from "./EventForm";
import { updateEventStatus } from "@/actions/events";
import { assignJudgeToEvent, removeJudgeAssignment } from "@/actions/judges";
import { formatDate, formatTime, EVENT_STATUSES, EventStatus, EventType } from "@/lib/constants";

export interface EventDetailData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  type: EventType;
  status: EventStatus;
  maxParticipants: number | null;
  durationMinutes: number | null;
  venueId: string | null;
  venue: { id: string; name: string; location: string | null } | null;
  schedules: {
    id: string;
    startTime: Date;
    endTime: Date;
    notes: string | null;
    venue: { name: string } | null;
  }[];
  coordinators: {
    id: string;
    user: { id: string; name: string; email: string; phone: string | null };
  }[];
  judges: {
    id: string;
    judge: {
      id: string;
      user: { id: string; name: string; email: string };
      designation: string | null;
      organization: string | null;
    };
  }[];
  registrations: {
    id: string;
    registrationNumber: string;
    teamName: string | null;
    status: string;
    registeredAt: Date;
    participants: {
      participant: {
        id: string;
        participantId: string;
        name: string;
        house: { name: string } | null;
      };
    }[];
  }[];
  results: {
    id: string;
    position: number | null;
    totalMarks: unknown;
    isWinner: boolean;
    participant: { name: string; house: { name: string } | null } | null;
  }[];
}

export function EventDetailClient({
  event,
  venues,
  availableJudges,
}: {
  event: EventDetailData;
  venues: VenueOption[];
  availableJudges: { id: string; user: { name: string; email: string } }[];
}) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedJudgeId, setSelectedJudgeId] = useState("");
  const [assigningJudge, setAssigningJudge] = useState(false);

  async function handleStatusChange(newStatus: EventStatus) {
    setStatusUpdating(true);
    try {
      await updateEventStatus(event.id, newStatus);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleAssignJudge() {
    if (!selectedJudgeId) return;
    setAssigningJudge(true);
    try {
      await assignJudgeToEvent(selectedJudgeId, event.id);
      setSelectedJudgeId("");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningJudge(false);
    }
  }

  async function handleRemoveJudge(judgeId: string) {
    try {
      await removeJudgeAssignment(judgeId, event.id);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-8">
      {/* Event Header Banner */}
      <div className="p-6 rounded-2xl border border-[#2f2b2c] bg-gradient-to-r from-[#171516] to-[#121112] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#931827] text-white">
              {event.code}
            </span>
            <Badge variant="primary">{event.category || "General"}</Badge>
            <Badge variant="neutral">{event.type}</Badge>
            <StatusBadge status={event.status} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {event.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            {event.description || "No description provided for this event."}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap shrink-0">
          {/* Status Changer Dropdown */}
          <select
            value={event.status}
            onChange={(e) => handleStatusChange(e.target.value as EventStatus)}
            disabled={statusUpdating}
            aria-label="Event Status"
            className="rounded-xl border border-[#3f393b] bg-[#201d1e] px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#931827] cursor-pointer"
          >
            {EVENT_STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Event
          </Button>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-xs font-medium text-zinc-400">Venue</p>
          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="truncate">{event.venue?.name || "TBA"}</span>
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs font-medium text-zinc-400">Max Participants</p>
          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Users className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>{event.maxParticipants || 1} per entry</span>
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs font-medium text-zinc-400">Duration</p>
          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>{event.durationMinutes ? `${event.durationMinutes} mins` : "TBD"}</span>
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs font-medium text-zinc-400">Registrations</p>
          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>{event.registrations.length} registered</span>
          </p>
        </Card>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Schedule & Judges */}
        <div className="space-y-6">
          {/* Schedules */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#931827]" />
                <CardTitle className="text-base">Schedule Slots</CardTitle>
              </div>
              <Link href="/admin/schedule">
                <Button variant="outline" size="sm">
                  Add Slot
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-[#231f20]">
              {event.schedules.length === 0 ? (
                <div className="p-5 text-center text-xs text-zinc-500">
                  No schedule slots assigned.
                </div>
              ) : (
                event.schedules.map((s) => (
                  <div key={s.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {formatDate(s.startTime)} • {formatTime(s.startTime)} - {formatTime(s.endTime)}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Venue: {s.venue?.name || event.venue?.name || "TBA"}
                        {s.notes && ` • ${s.notes}`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Judges */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#931827]" />
                <CardTitle className="text-base">Assigned Judges</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Quick Assign Form */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedJudgeId}
                  onChange={(e) => setSelectedJudgeId(e.target.value)}
                  aria-label="Select Judge to Assign"
                  className="flex-1 rounded-xl border border-[#2f2b2c] bg-[#100f10] px-3 py-2 text-xs text-white outline-none focus:border-[#931827]"
                >
                  <option value="">Select Judge to Assign...</option>
                  {availableJudges.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.user.name} ({j.user.email})
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={handleAssignJudge}
                  disabled={!selectedJudgeId || assigningJudge}
                  isLoading={assigningJudge}
                >
                  Assign
                </Button>
              </div>

              {/* Judges List */}
              <div className="divide-y divide-[#231f20]">
                {event.judges.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-3 text-center">
                    No judges assigned to this event yet.
                  </p>
                ) : (
                  event.judges.map((j) => (
                    <div
                      key={j.id}
                      className="py-2.5 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {j.judge.user.name}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {j.judge.designation || "Judge"} •{" "}
                          {j.judge.organization || "Izazov Panel"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 text-xs hover:bg-red-950/30"
                        onClick={() => handleRemoveJudge(j.judge.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Registrations & Results */}
        <div className="space-y-6">
          {/* Registrations List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#931827]" />
                <CardTitle className="text-base">Registered Participants</CardTitle>
              </div>
              <Link href="/admin/registrations">
                <Button variant="outline" size="sm">
                  Manage Registrations
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-[#231f20] max-h-80 overflow-y-auto">
              {event.registrations.length === 0 ? (
                <div className="p-5 text-center text-xs text-zinc-500">
                  No registrations recorded yet.
                </div>
              ) : (
                event.registrations.map((reg) => (
                  <div key={reg.id} className="p-3.5 sm:px-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-400">
                          {reg.registrationNumber}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {reg.teamName || reg.participants[0]?.participant?.name || "Participant"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        {reg.participants.map((p, idx) => (
                          <span key={p.participant.id}>
                            {p.participant.name}
                            {p.participant.house && ` (${p.participant.house.name})`}
                            {idx < reg.participants.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                    <StatusBadge status={reg.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Results / Podium */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#931827]" />
                <CardTitle className="text-base">Event Results</CardTitle>
              </div>
              <Link href="/admin/results">
                <Button variant="outline" size="sm">
                  Enter / Edit Results
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {event.results.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">
                  No results published yet. Scoring in progress.
                </p>
              ) : (
                <div className="space-y-2">
                  {event.results.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl border border-[#2d292a] bg-[#181617] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            res.position === 1
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : res.position === 2
                              ? "bg-zinc-400/20 text-zinc-200 border border-zinc-400/40"
                              : res.position === 3
                              ? "bg-amber-800/20 text-amber-500 border border-amber-800/40"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {res.position || "—"}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {res.participant?.name || "Team / Participant"}
                          </p>
                          {res.participant?.house && (
                            <p className="text-[10px] text-zinc-400">
                              House: {res.participant.house.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">
                        {String(res.totalMarks)} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Event Details"
        maxWidth="xl"
      >
        <EventForm
          initialData={event}
          venues={venues}
          isEdit={true}
        />
      </Modal>
    </div>
  );
}
