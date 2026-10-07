import React from "react";
import { getSchedules } from "@/actions/schedule";
import { getEvents } from "@/actions/events";
import { getVenues } from "@/actions/venues";
import { getCategories } from "@/actions/categories";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScheduleManagementClient } from "@/components/schedule/ScheduleManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const [schedulesRes, eventsRes, venuesRes, categoriesRes] =
    await Promise.all([
      getSchedules(),
      getEvents(),
      getVenues(),
      getCategories(true),
    ]);

  const schedules = schedulesRes.data || [];
  const events = (eventsRes.data || []).map((e) => ({
    id: e.id,
    name: e.name,
    code: e.code,
  }));
  const venues = (venuesRes.data || []).map((v) => ({
    id: v.id,
    name: v.name,
  }));
  const categories = (categoriesRes.data || []).map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule & Timeline"
        description="Plan and coordinate festival event slots across campus stages and halls."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Schedule" },
        ]}
      />

      <ScheduleManagementClient
        schedules={schedules}
        events={events}
        venues={venues}
        categories={categories}
      />
    </div>
  );
}
