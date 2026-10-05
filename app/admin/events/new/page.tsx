import React from "react";
import { getVenues } from "@/actions/venues";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { EventForm } from "@/components/events/EventForm";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const venuesResult = await getVenues();
  const venues = (venuesResult.data || []).map((v) => ({
    id: v.id,
    name: v.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Event"
        description="Add a new competition, workshop, or performance to IZAZOV 9.0."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Events", href: "/admin/events" },
          { label: "New Event" },
        ]}
      />

      <Card>
        <CardContent className="p-6">
          <EventForm venues={venues} />
        </CardContent>
      </Card>
    </div>
  );
}
