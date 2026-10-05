import React from "react";
import { notFound } from "next/navigation";
import { getEventById } from "@/actions/events";
import { getVenues } from "@/actions/venues";
import { getJudges } from "@/actions/judges";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventDetailClient } from "@/components/events/EventDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [eventRes, venuesRes, judgesRes] = await Promise.all([
    getEventById(id),
    getVenues(),
    getJudges(),
  ]);

  if (!eventRes.success || !eventRes.data) {
    notFound();
  }

  const event = eventRes.data;
  const venues = (venuesRes.data || []).map((v) => ({
    id: v.id,
    name: v.name,
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
        availableJudges={availableJudges}
      />
    </div>
  );
}
