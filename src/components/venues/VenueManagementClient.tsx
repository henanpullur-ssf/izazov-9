"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { createVenue, updateVenue, deleteVenue } from "@/actions/venues";

export interface VenueItem {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  capacity: number | null;
  imageUrl: string | null;
  isActive: boolean;
  _count?: {
    events: number;
    schedules: number;
  };
  events?: { id: string; name: string; code: string; status: string }[];
}

export function VenueManagementClient({
  venues,
}: {
  venues: VenueItem[];
}) {
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VenueItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VenueItem | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setName("");
    setLocation("");
    setDescription("");
    setCapacity("");
    setIsActive(true);
    setError("");
    setIsCreateOpen(true);
  }

  function openEdit(v: VenueItem) {
    setEditTarget(v);
    setName(v.name);
    setLocation(v.location || "");
    setDescription(v.description || "");
    setCapacity(v.capacity ? v.capacity.toString() : "");
    setIsActive(v.isActive);
    setError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name,
      location,
      description,
      capacity: capacity ? parseInt(capacity, 10) : undefined,
      isActive,
    };

    try {
      if (editTarget) {
        const res = await updateVenue(editTarget.id, payload);
        if (!res.success) {
          setError(res.error || "Failed to update venue");
        } else {
          setEditTarget(null);
          router.refresh();
        }
      } else {
        const res = await createVenue(payload);
        if (!res.success) {
          setError(res.error || "Failed to create venue");
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
      await deleteVenue(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Campus Stages & Halls
          </h2>
          <p className="text-xs text-zinc-500">
            {venues.length} venues registered for fest operations
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <PlusCircle className="w-4 h-4" />
          <span>Add Venue</span>
        </Button>
      </div>

      {venues.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-6 h-6 text-zinc-500" />}
          title="No venues registered"
          description="Add campus auditoriums, labs, open stages, and seminar halls."
          actionLabel="Add Venue"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {venues.map((v) => (
            <Card
              key={v.id}
              className="flex flex-col justify-between hover:border-[#3f393b] transition"
            >
              <CardHeader className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{v.name}</CardTitle>
                    {v.location && (
                      <p className="text-xs text-zinc-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>{v.location}</span>
                      </p>
                    )}
                  </div>
                  {v.isActive ? (
                    <Badge variant="success" className="text-[10px]">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="text-[10px]">
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {v.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-[#232021] text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Capacity: {v.capacity || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{v._count?.events || 0} events</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#232021]">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEdit(v)}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(v)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
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
        title={editTarget ? "Edit Venue Details" : "Add Campus Venue"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          <Input
            label="Venue Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Main Auditorium"
            required
          />

          <Input
            label="Campus Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Academic Block A, 2nd Floor"
          />

          <Input
            label="Seating / Floor Capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g. 500"
          />

          <Textarea
            label="Description & Facilities"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Audio systems, projector, stage dimensions..."
            rows={3}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveVenue"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-[#383334] text-[#931827] focus:ring-[#931827]"
            />
            <label htmlFor="isActiveVenue" className="text-xs text-zinc-300">
              Venue is active and ready for event scheduling
            </label>
          </div>

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
              {editTarget ? "Update Venue" : "Create Venue"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Venue"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete Venue"
        isLoading={loading}
      />
    </div>
  );
}
