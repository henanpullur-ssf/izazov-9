"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EVENT_STATUSES, EVENT_TYPES, EventStatus, EventType } from "@/lib/constants";
import { createEvent, updateEvent } from "@/actions/events";

export interface VenueOption {
  id: string;
  name: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  color?: string | null;
  isActive?: boolean;
}

export function EventForm({
  initialData,
  venues = [],
  categories = [],
  isEdit = false,
}: {
  initialData?: {
    id?: string;
    code?: string;
    name?: string;
    description?: string | null;
    category?: string | null;
    type?: EventType;
    status?: EventStatus;
    maxParticipants?: number | null;
    durationMinutes?: number | null;
    venueId?: string | null;
  };
  venues: VenueOption[];
  categories?: CategoryOption[];
  isEdit?: boolean;
}) {
  const router = useRouter();

  const initialCategory = initialData?.category;

  // Combine active categories with initialData category if not present
  const availableCategoryNames = React.useMemo(() => {
    const list = categories.map((c) => c.name);
    if (initialCategory && !list.includes(initialCategory)) {
      list.unshift(initialCategory);
    }
    if (list.length === 0) {
      list.push("General");
    }
    return list;
  }, [categories, initialCategory]);

  const [code, setCode] = useState(initialData?.code || "");
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(
    initialData?.category || availableCategoryNames[0] || "General"
  );
  const [type, setType] = useState<EventType>(
    initialData?.type || EventType.INDIVIDUAL
  );
  const [status, setStatus] = useState<EventStatus>(
    initialData?.status || EventStatus.DRAFT
  );
  const [maxParticipants, setMaxParticipants] = useState(
    initialData?.maxParticipants?.toString() || "1"
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialData?.durationMinutes?.toString() || "60"
  );
  const [venueId, setVenueId] = useState(initialData?.venueId || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const payload = {
      code,
      name,
      description,
      category,
      type,
      status,
      maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : undefined,
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
      venueId: venueId || undefined,
    };

    try {
      if (isEdit && initialData?.id) {
        const res = await updateEvent(initialData.id, payload);
        if (!res.success) {
          setError(res.error || "Failed to update event");
        } else {
          setSuccess("Event updated successfully!");
          router.push(`/admin/events/${initialData.id}`);
          router.refresh();
        }
      } else {
        const res = await createEvent(payload);
        if (!res.success) {
          setError(res.error || "Failed to create event");
        } else {
          setSuccess("Event created successfully!");
          router.push("/admin/events");
          router.refresh();
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Event Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. EV-DANCE, EV-HACK"
          required
          disabled={isEdit}
          helperText="Unique uppercase identifier for this event"
        />

        <Input
          label="Event Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rhythm Clash Dance Battle"
          required
        />
      </div>

      <Textarea
        label="Event Description & Rules"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Detail event guidelines, format, rules, and judging criteria..."
        rows={4}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {availableCategoryNames.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        <Select
          label="Participation Type"
          value={type}
          onChange={(e) => setType(e.target.value as EventType)}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>

        <Select
          label="Event Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as EventStatus)}
        >
          {EVENT_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Max Participants / Team Size"
          type="number"
          min="1"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
          placeholder="e.g. 1 (Solo) or 5 (Team)"
        />

        <Input
          label="Duration (Minutes)"
          type="number"
          min="10"
          step="5"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          placeholder="e.g. 60"
        />

        <Select
          label="Primary Venue"
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
        >
          <option value="">No Venue Assigned</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-[#292526]">
        <Button type="submit" isLoading={loading}>
          {isEdit ? "Update Event" : "Create Event"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
