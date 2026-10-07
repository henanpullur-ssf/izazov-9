import React from "react";
import { getResults } from "@/actions/results";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { ResultsManagementClient, type ResultItem, type EventOption } from "@/components/results/ResultsManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage() {
  const [resultsRes, events] = await Promise.all([
    getResults(),
    prisma.event.findMany({
      include: {
        registrations: {
          include: {
            participants: {
              include: {
                participant: {
                  include: { house: true },
                },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const results = (resultsRes.data || []) as unknown as ResultItem[];
  const formattedEvents: EventOption[] = events.map((e) => ({
    id: e.id,
    name: e.name,
    code: e.code,
    category: e.category,
    registrations: e.registrations.map((r) => ({
      id: r.id,
      registrationNumber: r.registrationNumber,
      teamName: r.teamName,
      participants: r.participants.map((rp) => ({
        participant: {
          id: rp.participant.id,
          name: rp.participant.name,
          participantId: rp.participant.participantId,
          rollNumber: rp.participant.rollNumber,
          house: rp.participant.house ? { name: rp.participant.house.name } : null,
        },
      })),
    })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competition Results"
        description="Enter manual points, select grades and prizes, and publish official festival results."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Results" },
        ]}
      />

      <ResultsManagementClient
        results={results}
        events={formattedEvents}
      />
    </div>
  );
}
