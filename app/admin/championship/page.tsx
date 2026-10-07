import React from "react";
import { getChampionshipData } from "@/actions/results";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChampionshipDashboardClient, type ChampionshipData } from "@/components/championship/ChampionshipDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminChampionshipPage() {
  const res = await getChampionshipData();
  const defaultData: ChampionshipData = {
    totalPublishedCount: 0,
    checkpointCount: 0,
    nextCheckpoint: 5,
    resultsUntilNextCheckpoint: 5,
    liveTeamStandings: [],
    publicTeamStandings: [],
    individualStandings: [],
  };

  const data = (res.data || defaultData) as ChampionshipData;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Championship Scoreboard"
        description="Monitor real-time live Team standings, checkpoints, and confidential admin-only individual rankings."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Championship" },
        ]}
      />

      <ChampionshipDashboardClient data={data} />
    </div>
  );
}
