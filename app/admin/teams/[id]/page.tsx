import React from "react";
import { notFound } from "next/navigation";
import { getTeamById } from "@/actions/teams";
import { PageHeader } from "@/components/ui/PageHeader";
import { TeamDetailClient, type TeamDetailData } from "@/components/teams/TeamDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminTeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teamRes = await getTeamById(id);

  if (!teamRes.success || !teamRes.data) {
    notFound();
  }

  const team = teamRes.data as unknown as TeamDetailData;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Team ${team.name}`}
        description={`Team Championship Profile • Rank #${team.rank} • ${team.totalPoints} Points`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Teams", href: "/admin/teams" },
          { label: team.name },
        ]}
      />

      <TeamDetailClient team={team} />
    </div>
  );
}
