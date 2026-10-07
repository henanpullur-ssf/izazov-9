import React from "react";
import { requireModule } from "@/lib/auth-helpers";
import { getJudges } from "@/actions/judges";
import { getEvents } from "@/actions/events";
import { PageHeader } from "@/components/ui/PageHeader";
import { JudgeManagementClient } from "@/components/judges/JudgeManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminJudgesPage() {
  await requireModule("operations");

  const [judgesRes, eventsRes] = await Promise.all([
    getJudges(),
    getEvents(),
  ]);

  const judges = judgesRes.data || [];
  const events = (eventsRes.data || []).map((e) => ({
    id: e.id,
    name: e.name,
    code: e.code,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jury & Judges Panel"
        description="Manage expert judges and assign evaluation duties per competition."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Judges" },
        ]}
      />

      <JudgeManagementClient
        judges={judges}
        events={events}
      />
    </div>
  );
}
