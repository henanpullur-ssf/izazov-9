import React from "react";
import { requireModule } from "@/lib/auth-helpers";
import { getVolunteers } from "@/actions/volunteers";
import { getEvents } from "@/actions/events";
import { getVenues } from "@/actions/venues";
import { PageHeader } from "@/components/ui/PageHeader";
import { VolunteerManagementClient, type VolunteerItem } from "@/components/volunteers/VolunteerManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminVolunteersPage() {
  await requireModule("operations");

  const [volRes, eventsRes, venuesRes] = await Promise.all([
    getVolunteers(),
    getEvents(),
    getVenues(),
  ]);

  const volunteers = volRes.data || [];
  const events = (eventsRes.data || []).map((e) => ({
    id: e.id,
    name: e.name,
    code: e.code,
  }));
  const venues = (venuesRes.data || []).map((v) => ({
    id: v.id,
    name: v.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Operations"
        description="Assign student crew members to stages, gate security, logistics, and hospitality."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Volunteers" },
        ]}
      />

      <VolunteerManagementClient
        volunteers={volunteers as unknown as VolunteerItem[]}
        events={events}
        venues={venues}
      />
    </div>
  );
}
