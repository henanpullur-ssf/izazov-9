import React from "react";
import { getTeams } from "@/actions/teams";
import { PageHeader } from "@/components/ui/PageHeader";
import { TeamListClient, type TeamItem } from "@/components/teams/TeamListClient";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const teamsRes = await getTeams();
  const teams = (teamsRes.data || []) as unknown as TeamItem[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fest Teams & Houses"
        description="Manage festival teams, leadership assignments, and overall championship point standings."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Teams" },
        ]}
      />

      <TeamListClient teams={teams} />
    </div>
  );
}
