import React from "react";
import { getParticipants } from "@/actions/participants";
import { getHouses } from "@/actions/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import { ParticipantListClient } from "@/components/participants/ParticipantListClient";

export const dynamic = "force-dynamic";

export default async function AdminParticipantsPage() {
  const [participantsRes, housesRes] = await Promise.all([
    getParticipants(),
    getHouses(),
  ]);

  const participants = participantsRes.data || [];
  const houses = (housesRes.data || []).map((h) => ({
    id: h.id,
    name: h.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Participant Directory"
        description="Manage festival participants, house assignments, contact profiles, and security passes."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Participants" },
        ]}
      />

      <ParticipantListClient
        participants={participants}
        houses={houses}
      />
    </div>
  );
}
