"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Eye,
  Trash2,
  MapPin,
  Users,
  PlusCircle,
} from "lucide-react";
import { SearchFilterBar } from "@/components/ui/SearchFilterBar";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/Table";
import { EVENT_STATUSES, EVENT_TYPES, EventStatus, EventType } from "@/lib/constants";
import { deleteEvent } from "@/actions/events";
import { useRouter } from "next/navigation";

export interface EventListItem {
  id: string;
  code: string;
  name: string;
  category: string | null;
  type: EventType;
  status: EventStatus;
  maxParticipants: number | null;
  durationMinutes: number | null;
  venue?: { id: string; name: string } | null;
  _count?: {
    registrations: number;
    judges: number;
    results: number;
  };
}

export function EventListClient({
  events,
  categories = [],
}: {
  events: EventListItem[];
  categories?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");

  const [deleteTarget, setDeleteTarget] = useState<EventListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryOptions = useMemo(() => {
    const names = new Set(categories.map((c) => c.name));
    events.forEach((e) => {
      if (e.category) names.add(e.category);
    });
    return Array.from(names);
  }, [categories, events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        search === "" ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.code.toLowerCase().includes(search.toLowerCase()) ||
        (e.category && e.category.toLowerCase().includes(search.toLowerCase()));

      const matchesCat = category === "ALL" || e.category === category;
      const matchesStatus = status === "ALL" || e.status === status;
      const matchesType = type === "ALL" || e.type === type;

      return matchesSearch && matchesCat && matchesStatus && matchesType;
    });
  }, [events, search, category, status, type]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEvent(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search event by name or code..."
        filters={[
          {
            id: "category",
            label: "Category",
            value: category,
            options: [
              { label: "All Categories", value: "ALL" },
              ...categoryOptions.map((c) => ({ label: c, value: c })),
            ],
            onChange: setCategory,
          },
          {
            id: "status",
            label: "Status",
            value: status,
            options: [
              { label: "All Statuses", value: "ALL" },
              ...EVENT_STATUSES.map((s) => ({ label: s, value: s })),
            ],
            onChange: setStatus,
          },
          {
            id: "type",
            label: "Type",
            value: type,
            options: [
              { label: "All Types", value: "ALL" },
              ...EVENT_TYPES.map((t) => ({ label: t, value: t })),
            ],
            onChange: setType,
          },
        ]}
      >
        <Link href="/admin/events/new">
          <Button size="sm" className="gap-1.5 whitespace-nowrap">
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </Button>
        </Link>
      </SearchFilterBar>

      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-6 h-6 text-zinc-500" />}
          title="No events found"
          description={
            search || category !== "ALL" || status !== "ALL" || type !== "ALL"
              ? "Try adjusting your search query or filters."
              : "Get started by creating your first festival event."
          }
          actionLabel="Create Event"
          actionHref="/admin/events/new"
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Event</TableHeader>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Type & Size</TableHeader>
                    <TableHeader>Venue</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader className="text-right">Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.map((evt) => (
                    <TableRow key={evt.id}>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {evt.name}
                            </span>
                            <Badge variant="primary" className="text-[10px]">
                              {evt.code}
                            </Badge>
                          </div>
                          {evt._count && (
                            <p className="text-xs text-zinc-500">
                              {evt._count.registrations} registered •{" "}
                              {evt._count.judges} judges
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-zinc-300">
                          {evt.category || "General"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                          <Users className="w-3.5 h-3.5 text-zinc-500" />
                          <span>
                            {evt.type} (max {evt.maxParticipants || 1})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{evt.venue?.name || "TBA"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={evt.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/events/${evt.id}`}>
                            <Button variant="secondary" size="sm">
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline ml-1">Manage</span>
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(evt)}
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-xl border border-[#2d292a] bg-[#141314] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-[#931827]">
                        {evt.code}
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs text-zinc-400">{evt.category}</span>
                    </div>
                    <h3 className="font-semibold text-white text-base">
                      {evt.name}
                    </h3>
                  </div>
                  <StatusBadge status={evt.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 pt-2 border-t border-[#232021]">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{evt.type} ({evt.maxParticipants || 1})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="truncate">{evt.venue?.name || "TBA"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232021]">
                  <Link href={`/admin/events/${evt.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Manage Event
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(evt)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.code})? This will also remove associated schedules, registrations, and scores.`}
        confirmLabel="Delete Event"
        isLoading={isDeleting}
      />
    </div>
  );
}
