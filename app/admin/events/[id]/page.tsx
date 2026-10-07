import React from "react";
import { notFound } from "next/navigation";
import { getEventById } from "@/actions/events";
import { getVenues } from "@/actions/venues";
import { getJudges } from "@/actions/judges";
import { getCategories } from "@/actions/categories";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventDetailClient } from "@/components/events/EventDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [eventRes, venuesRes, judgesRes, categoriesRes] = await Promise.all([
    getEventById(id),
    getVenues(),
    getJudges(),
    getCategories(false),
  ]);

  if (!eventRes.success || !eventRes.data) {
    notFound();
  }

  const event = eventRes.data;
  const venues = (venuesRes.data || []).map((v) => ({
    id: v.id,
    name: v.name,
  }));
  const categories = (categoriesRes.data || []).map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    isActive: c.isActive,
  }));
  const availableJudges = (judgesRes.data || []).map((j) => ({
    id: j.id,
    user: {
      name: j.user.name,
      email: j.user.email,
    },
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.name}
        description={`Event Code: ${event.code} • Category: ${event.category || "General"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Events", href: "/admin/events" },
          { label: event.code },
        ]}
      />

      <EventDetailClient
        event={event}
        venues={venues}
        categories={categories}
        availableJudges={availableJudges}
      />
    </div>
  );
}
