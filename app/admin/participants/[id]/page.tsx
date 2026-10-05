import React from "react";
import { notFound } from "next/navigation";
import { getParticipantById } from "@/actions/participants";
import { getHouses } from "@/actions/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import { ParticipantDetailClient } from "@/components/participants/ParticipantDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminParticipantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [participantRes, housesRes] = await Promise.all([
    getParticipantById(id),
    getHouses(),
  ]);

  if (!participantRes.success || !participantRes.data) {
    notFound();
  }

  const participant = participantRes.data;
  const houses = (housesRes.data || []).map((h) => ({
    id: h.id,
    name: h.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={participant.name}
        description={`Participant ID: ${participant.participantId}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Participants", href: "/admin/participants" },
          { label: participant.participantId },
        ]}
      />

      <ParticipantDetailClient
        participant={participant}
        houses={houses}
      />
    </div>
  );
}
