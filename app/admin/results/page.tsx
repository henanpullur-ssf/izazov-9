import React from "react";
import { getResults } from "@/actions/results";
import { getEvents } from "@/actions/events";
import { PageHeader } from "@/components/ui/PageHeader";
import { ResultsManagementClient } from "@/components/results/ResultsManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage() {
  const [resultsRes, eventsRes] = await Promise.all([
    getResults(),
    getEvents(),
  ]);

  const results = resultsRes.data || [];
  const events = (eventsRes.data || []).map((e) => ({
    id: e.id,
    name: e.name,
    code: e.code,
    registrations: [],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competition Results"
        description="Publish official scores, podium positions, and winners for festival events."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Results" },
        ]}
      />

      <ResultsManagementClient
        results={results}
        events={events}
      />
    </div>
  );
}
