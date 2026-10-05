"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HeartHandshake,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  assignVolunteer,
  updateVolunteerAssignmentStatus,
  deleteVolunteerAssignment,
} from "@/actions/volunteers";
import { formatTime } from "@/lib/constants";

export interface VolunteerItem {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  assignments: {
    id: string;
    duty: string | null;
    venueId: string | null;
    checkedInAt: Date | null;
    checkedOutAt: Date | null;
    event: { id: string; name: string; code: string } | null;
  }[];
}

export function VolunteerManagementClient({
  volunteers,
  events = [],
  venues = [],
}: {
  volunteers: VolunteerItem[];
  events: { id: string; name: string; code: string }[];
  venues: { id: string; name: string }[];
}) {
  const router = useRouter();

  const [assignTarget, setAssignTarget] = useState<VolunteerItem | null>(null);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [duty, setDuty] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignTarget) return;

    setLoading(true);
    try {
      await assignVolunteer({
        volunteerId: assignTarget.id,
        userId: assignTarget.userId,
        eventId: selectedEventId || undefined,
        venueId: selectedVenueId || undefined,
        duty,
      });
      setAssignTarget(null);
      setDuty("");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckInOut(assignmentId: string, type: "in" | "out") {
    try {
      await updateVolunteerAssignmentStatus(assignmentId, type);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteAssignment(assignmentId: string) {
    try {
      await deleteVolunteerAssignment(assignmentId);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {volunteers.length === 0 ? (
        <EmptyState
          icon={<HeartHandshake className="w-6 h-6 text-zinc-500" />}
          title="No volunteers registered"
          description="Volunteers will appear here once student volunteers sign up or are assigned the Volunteer role in Settings."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {volunteers.map((vol) => (
            <Card key={vol.id} className="space-y-4">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{vol.user.name}</CardTitle>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {vol.user.email} {vol.user.phone ? `• ${vol.user.phone}` : ""}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setAssignTarget(vol);
                      setSelectedEventId(events[0]?.id || "");
                      setSelectedVenueId(venues[0]?.id || "");
                      setDuty("");
                    }}
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    Assign Duty
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Duty Assignments ({vol.assignments.length})
                </p>

                {vol.assignments.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-2">
                    No active assignments.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {vol.assignments.map((asg) => (
                      <div
                        key={asg.id}
                        className="p-3 rounded-xl border border-[#2d292a] bg-[#181617] space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-white">
                              {asg.duty || "General Operations"}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              {asg.event ? `Event: ${asg.event.name}` : "Campus Floating"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteAssignment(asg.id)}
                            className="text-zinc-500 hover:text-red-400 p-1"
                            title="Remove assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#242122] text-[11px]">
                          <div className="flex items-center gap-2 text-zinc-400">
                            {asg.checkedInAt ? (
                              <span className="text-emerald-400">
                                In: {formatTime(asg.checkedInAt)}
                              </span>
                            ) : (
                              <span>Not Checked In</span>
                            )}
                            {asg.checkedOutAt && (
                              <span className="text-zinc-500">
                                • Out: {formatTime(asg.checkedOutAt)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {!asg.checkedInAt && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[10px] py-0.5 px-2"
                                onClick={() => handleCheckInOut(asg.id, "in")}
                              >
                                Check In
                              </Button>
                            )}
                            {asg.checkedInAt && !asg.checkedOutAt && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="text-[10px] py-0.5 px-2"
                                onClick={() => handleCheckInOut(asg.id, "out")}
                              >
                                Check Out
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Duty Modal */}
      <Modal
        isOpen={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        title={`Assign Duty to ${assignTarget?.user.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <Select
            label="Event (Optional)"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">General / Campus Floating Duty</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} - {e.name}
              </option>
            ))}
          </Select>

          <Select
            label="Assigned Venue (Optional)"
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
          >
            <option value="">No Venue Specified</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>

          <Input
            label="Duty Description"
            value={duty}
            onChange={(e) => setDuty(e.target.value)}
            placeholder="e.g. Stage Sound Coordination, Gate Pass Verification..."
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292526]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAssignTarget(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              Assign Duty
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
