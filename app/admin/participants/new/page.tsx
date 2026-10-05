import React from "react";
import { getHouses } from "@/actions/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { ParticipantForm } from "@/components/participants/ParticipantForm";

export const dynamic = "force-dynamic";

export default async function NewParticipantPage() {
  const housesRes = await getHouses();
  const houses = (housesRes.data || []).map((h) => ({
    id: h.id,
    name: h.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register New Participant"
        description="Add a participant profile and generate a unique QR token pass."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Participants", href: "/admin/participants" },
          { label: "New Participant" },
        ]}
      />

      <Card>
        <CardContent className="p-6">
          <ParticipantForm houses={houses} />
        </CardContent>
      </Card>
    </div>
  );
}
