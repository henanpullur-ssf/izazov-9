"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  PlusCircle,
  Edit,
  Trash2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "@/actions/schedule";
import { formatDate, formatTime } from "@/lib/constants";

export interface ScheduleItem {
  id: string;
  eventId: string;
  venueId: string | null;
  startTime: Date;
  endTime: Date;
  notes: string | null;
  event: {
    id: string;
    code: string;
    name: string;
    category: string | null;
    status: string;
  };
  venue: {
    id: string;
    name: string;
    location: string | null;
  } | null;
}

export function ScheduleManagementClient({
  schedules,
  events = [],
  venues = [],
  categories = [],
}: {
  schedules: ScheduleItem[];
  events: { id: string; name: string; code: string }[];
  venues: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
}) {
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ScheduleItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleItem | null>(null);

  // Filters
  const [selectedVenue, setSelectedVenue] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categoryOptions = useMemo(() => {
    const names = new Set(categories.map((c) => c.name));
    schedules.forEach((s) => {
      if (s.event.category) names.add(s.event.category);
    });
    return Array.from(names);
  }, [categories, schedules]);

  // Form State
  const [eventId, setEventId] = useState(events[0]?.id || "");
  const [venueId, setVenueId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function formatDateTimeInput(date: Date | string) {
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  }

  function openCreate() {
    setEventId(events[0]?.id || "");
    setVenueId(venues[0]?.id || "");
    const now = new Date();
    setStartTime(formatDateTimeInput(now));
    setEndTime(formatDateTimeInput(new Date(now.getTime() + 2 * 60 * 60 * 1000)));
    setNotes("");
    setError("");
    setIsCreateOpen(true);
  }

  function openEdit(s: ScheduleItem) {
    setEditTarget(s);
    setEventId(s.eventId);
    setVenueId(s.venueId || "");
    setStartTime(formatDateTimeInput(s.startTime));
    setEndTime(formatDateTimeInput(s.endTime));
    setNotes(s.notes || "");
    setError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      eventId,
      venueId: venueId || undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      notes,
    };

    try {
      if (editTarget) {
        const res = await updateSchedule(editTarget.id, payload);
        if (!res.success) {
          setError(res.error || "Failed to update schedule");
        } else {
          setEditTarget(null);
          router.refresh();
        }
      } else {
        const res = await createSchedule(payload);
        if (!res.success) {
          setError(res.error || "Failed to create schedule");
        } else {
          setIsCreateOpen(false);
          router.refresh();
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await deleteSchedule(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchVenue = selectedVenue === "ALL" || s.venueId === selectedVenue;
      const matchCat =
        selectedCategory === "ALL" || s.event.category === selectedCategory;
      return matchVenue && matchCat;
    });
  }, [schedules, selectedVenue, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Action and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            aria-label="Filter by Venue"
            className="rounded-xl border border-[#2f2b2c] bg-[#121112] px-3.5 py-2 text-xs text-zinc-300 outline-none focus:border-[#931827] cursor-pointer"
          >
            <option value="ALL">All Venues</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by Category"
            className="rounded-xl border border-[#2f2b2c] bg-[#121112] px-3.5 py-2 text-xs text-zinc-300 outline-none focus:border-[#931827] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={openCreate} size="sm" className="gap-1.5 whitespace-nowrap">
          <PlusCircle className="w-4 h-4" />
          <span>Add Schedule Slot</span>
        </Button>
      </div>

      {filteredSchedules.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-6 h-6 text-zinc-500" />}
          title="No schedule slots configured"
          description="Create time slots, assign events to venues, and build the fest itinerary."
          actionLabel="Create Schedule Slot"
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-3">
          {filteredSchedules.map((s) => (
            <Card
              key={s.id}
              className="p-4 sm:p-5 hover:border-[#383334] transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="primary" className="text-[10px]">
                      {s.event.code}
                    </Badge>
                    <span className="text-sm sm:text-base font-bold text-white">
                      {s.event.name}
                    </span>
                    <StatusBadge status={s.event.status} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <Clock className="w-3.5 h-3.5 text-[#931827]" />
                      <span>
                        {formatDate(s.startTime)} • {formatTime(s.startTime)} -{" "}
                        {formatTime(s.endTime)}
                      </span>
                    </span>

                    {s.venue && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{s.venue.name}</span>
                      </span>
                    )}

                    {s.notes && (
                      <span className="text-zinc-500 italic">
                        Note: {s.notes}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEdit(s)}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(s)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || Boolean(editTarget)}
        onClose={() => {
          setIsCreateOpen(false);
          setEditTarget(null);
        }}
        title={editTarget ? "Edit Schedule Slot" : "Create Schedule Entry"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          <Select
            label="Select Event"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            required
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.code} - {evt.name}
              </option>
            ))}
          </Select>

          <Select
            label="Assigned Venue"
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
          >
            <option value="">No Venue (Online / TBA)</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />

            <Input
              label="End Date & Time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Schedule Notes & Instructions"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Reporting time 15m before start, bring laptop..."
            rows={2}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292526]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreateOpen(false);
                setEditTarget(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              {editTarget ? "Update Schedule" : "Create Schedule"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Schedule Entry"
        message={`Are you sure you want to remove this schedule slot for "${deleteTarget?.event.name}"?`}
        confirmLabel="Delete Slot"
        isLoading={loading}
      />
    </div>
  );
}
