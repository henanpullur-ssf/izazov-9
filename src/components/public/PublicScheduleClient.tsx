"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatTime, EVENT_CATEGORIES } from "@/lib/constants";

export interface PublicScheduleItem {
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

export function PublicScheduleClient({
  schedules,
  venues = [],
}: {
  schedules: PublicScheduleItem[];
  venues: { id: string; name: string }[];
}) {
  const [selectedVenue, setSelectedVenue] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      const matchVenue = selectedVenue === "ALL" || s.venueId === selectedVenue;
      const matchCat =
        selectedCategory === "ALL" || s.event.category === selectedCategory;
      const matchSearch =
        search === "" ||
        s.event.name.toLowerCase().includes(search.toLowerCase()) ||
        s.event.code.toLowerCase().includes(search.toLowerCase());
      return matchVenue && matchCat && matchSearch;
    });
  }, [schedules, selectedVenue, selectedCategory, search]);

  // Group by Date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, PublicScheduleItem[]> = {};
    filtered.forEach((item) => {
      const d = formatDate(item.startTime);
      if (!groups[d]) {
        groups[d] = [];
      }
      groups[d].push(item);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#2d292a] bg-[#121112] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter schedule by event name or code..."
          className="rounded-xl border border-[#332f30] bg-[#0c0b0c] px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#931827] flex-1 max-w-sm"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            aria-label="Filter Schedule by Venue"
            className="rounded-xl border border-[#332f30] bg-[#181617] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#931827] cursor-pointer"
          >
            <option value="ALL">All Venues & Stages</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter Schedule by Category"
            className="rounded-xl border border-[#332f30] bg-[#181617] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#931827] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grouped Timeline */}
      {Object.keys(groupedByDate).length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6 text-zinc-500" />}
          title="No scheduled events found"
          description="Try changing your date, venue, or category filter."
        />
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedByDate).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-[#242122]">
                <Calendar className="w-4 h-4 text-[#931827]" />
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {dateLabel}
                </h2>
                <span className="text-xs text-zinc-500">
                  ({items.length} events scheduled)
                </span>
              </div>

              <div className="space-y-3">
                {items.map((slot) => (
                  <Card
                    key={slot.id}
                    className="p-4 sm:p-5 hover:border-[#931827] transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="primary" className="text-[10px]">
                            {slot.event.code}
                          </Badge>
                          <Link
                            href={`/events/${slot.event.id}`}
                            className="font-bold text-white text-base hover:text-red-400 transition"
                          >
                            {slot.event.name}
                          </Link>
                          <StatusBadge status={slot.event.status} />
                        </div>

                        <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                          <span className="flex items-center gap-1.5 text-zinc-200 font-medium">
                            <Clock className="w-3.5 h-3.5 text-[#931827]" />
                            <span>
                              {formatTime(slot.startTime)} -{" "}
                              {formatTime(slot.endTime)}
                            </span>
                          </span>

                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{slot.venue?.name || "Main Campus"}</span>
                          </span>

                          {slot.event.category && (
                            <span className="text-zinc-500">
                              • {slot.event.category}
                            </span>
                          )}
                        </div>

                        {slot.notes && (
                          <p className="text-[11px] text-zinc-400 italic pt-1">
                            Note: {slot.notes}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <Link href={`/events/${slot.event.id}`}>
                          <Button variant="secondary" size="sm" className="gap-1">
                            <span>Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
