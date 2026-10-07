import React from "react";
import { requireModule } from "@/lib/auth-helpers";
import { getVenues } from "@/actions/venues";
import { PageHeader } from "@/components/ui/PageHeader";
import { VenueManagementClient, type VenueItem } from "@/components/venues/VenueManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminVenuesPage() {
  await requireModule("fest_management");

  const result = await getVenues();
  const venues = result.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Venue Management"
        description="Configure festival stages, halls, computing labs, and outdoor arenas."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Venues" },
        ]}
      />

      <VenueManagementClient venues={venues as unknown as VenueItem[]} />
    </div>
  );
}
