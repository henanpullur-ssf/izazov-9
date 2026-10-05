import React from "react";
import { getEvents } from "@/actions/events";
import { getScores } from "@/actions/scoring";
import { getJudges } from "@/actions/judges";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScoringInterfaceClient, ScoringEvent, ExistingScore } from "@/components/scoring/ScoringInterfaceClient";

export const dynamic = "force-dynamic";

export default async function AdminScoringPage() {
  const [eventsRes, scoresRes, judgesRes] = await Promise.all([
    getEvents(),
    getScores(),
    getJudges(),
  ]);

  const rawEvents = eventsRes.data || [];
  const initialScores: ExistingScore[] = (scoresRes.data || []).map((s) => ({
    id: s.id,
    eventId: s.eventId,
    registrationId: s.registrationId,
    judgeId: s.judgeId,
    marks: s.marks,
    maxMarks: s.maxMarks,
    remarks: s.remarks,
    status: s.status,
  }));

  const allJudges = (judgesRes.data || []).map((j) => ({
    id: j.id,
    user: { name: j.user.name },
  }));

  const events: ScoringEvent[] = rawEvents.map((e) => ({
    id: e.id,
    code: e.code,
    name: e.name,
    judges: [],
    registrations: [],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competition Scoring"
        description="Enter, evaluate, and lock participant marks and judge scorecards."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Scoring" },
        ]}
      />

      <ScoringInterfaceClient
        events={events}
        initialScores={initialScores}
        allJudges={allJudges}
      />
    </div>
  );
}
