"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { EVENT_TYPES, EVENT_STATUSES, EventStatus, EventType } from "@/lib/constants";

export interface PublicEventItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  type: EventType;
  status: EventStatus;
  maxParticipants: number | null;
  durationMinutes: number | null;
  venue: { id: string; name: string; location: string | null } | null;
  schedules: { id: string; startTime: Date; endTime: Date }[];
}

export function PublicEventsClient({
  events,
  categories = [],
  initialCategory,
}: {
  events: PublicEventItem[];
  categories?: { id: string; name: string; color?: string | null }[];
  initialCategory?: string;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory || "ALL");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const categoryOptions = useMemo(() => {
    const names = new Set(categories.map((c) => c.name));
    events.forEach((e) => {
      if (e.category) names.add(e.category);
    });
    return Array.from(names);
  }, [categories, events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        search === "" ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.code.toLowerCase().includes(search.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(search.toLowerCase()));

      const matchCat = category === "ALL" || e.category === category;
      const matchType = type === "ALL" || e.type === type;
      const matchStatus = status === "ALL" || e.status === status;

      return matchSearch && matchCat && matchType && matchStatus;
    });
  }, [events, search, category, type, status]);

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-card)] space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search competitions, hackathons, dance battles, esports..."
            className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]"
          />
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="text-[var(--text-muted)] font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[var(--brand)]" /> Filters:
          </span>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by Category"
            className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)] outline-none focus:border-[var(--brand)] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Filter by Type"
            className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)] outline-none focus:border-[var(--brand)] cursor-pointer"
          >
            <option value="ALL">All Types (Solo & Group)</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by Status"
            className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)] outline-none focus:border-[var(--brand)] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {EVENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {(search || category !== "ALL" || type !== "ALL" || status !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("ALL");
                setType("ALL");
                setStatus("ALL");
              }}
              className="text-xs text-[var(--brand)] hover:underline ml-auto font-medium cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-6 h-6 text-[var(--text-dim)]" />}
          title="No events match your criteria"
          description="Try selecting a different category or clearing search keywords."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <Card
              key={evt.id}
              className="flex flex-col justify-between hover:border-[var(--brand)] transition group"
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge variant="primary" className="text-[10px]">
                    {evt.code}
                  </Badge>
                  <StatusBadge status={evt.status} />
                </div>
                <CardTitle className="text-base group-hover:text-[var(--brand)] transition-colors">
                  {evt.name}
                </CardTitle>
                <p className="text-xs text-[var(--text-muted)] font-medium">
                  {evt.category || "General Competition"}
                </p>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                  {evt.description || "Details and rules available on event page."}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                    <span>
                      {evt.type} ({evt.maxParticipants || 1})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                    <span>
                      {evt.durationMinutes ? `${evt.durationMinutes}m` : "TBA"}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--brand)]" />
                  <span className="truncate">{evt.venue?.name || "Venue TBA"}</span>
                </div>

                <div className="pt-2">
                  <Link href={`/events/${evt.id}`}>
                    <Button variant="secondary" size="sm" className="w-full gap-1.5">
                      <span>Explore & Register</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
