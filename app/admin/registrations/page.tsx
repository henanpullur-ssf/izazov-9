import React from "react";
import { getRegistrations } from "@/actions/registrations";
import { getEvents } from "@/actions/events";
import { getParticipants } from "@/actions/participants";
import { PageHeader } from "@/components/ui/PageHeader";
import { RegistrationManagementClient } from "@/components/registrations/RegistrationManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage() {
  const [regRes, eventsRes, partRes] = await Promise.all([
    getRegistrations(),
    getEvents(),
    getParticipants(),
  ]);

  const registrations = regRes.data || [];
  const events = (eventsRes.data || []).map((e) => ({
    id: e.id,
    name: e.name,
    code: e.code,
    maxParticipants: e.maxParticipants,
  }));
  const participants = (partRes.data || []).map((p) => ({
    id: p.id,
    name: p.name,
    participantId: p.participantId,
    houseName: p.house?.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Registrations"
        description="Manage participant and team entries across all festival events."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Registrations" },
        ]}
      />

      <RegistrationManagementClient
        registrations={registrations}
        events={events}
        participants={participants}
      />
    </div>
  );
}
