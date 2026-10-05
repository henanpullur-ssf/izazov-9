import React from "react";
import { getAttendance } from "@/actions/attendance";
import { getEvents } from "@/actions/events";
import { getParticipants } from "@/actions/participants";
import { PageHeader } from "@/components/ui/PageHeader";
import { AttendanceManagementClient } from "@/components/attendance/AttendanceManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  const [attRes, eventsRes, partRes] = await Promise.all([
    getAttendance(),
    getEvents(),
    getParticipants(),
  ]);

  const records = attRes.data || [];
  const events = (eventsRes.data || []).map((e) => ({
    id: e.id,
    name: e.name,
    code: e.code,
  }));
  const participants = (partRes.data || []).map((p) => ({
    id: p.id,
    name: p.name,
    participantId: p.participantId,
    houseName: p.house?.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance & Check-in"
        description="Verify festival gate passes, scan QR tokens, and track participant attendance per event."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Attendance" },
        ]}
      />

      <AttendanceManagementClient
        records={records}
        events={events}
        participants={participants}
      />
    </div>
  );
}
