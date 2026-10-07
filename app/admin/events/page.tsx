import React from "react";
import { getEvents } from "@/actions/events";
import { getCategories } from "@/actions/categories";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventListClient } from "@/components/events/EventListClient";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const [eventsResult, categoriesResult] = await Promise.all([
    getEvents(),
    getCategories(true),
  ]);

  const events = eventsResult.data || [];
  const categories = (categoriesResult.data || []).map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events Management"
        description="Configure festival competitions, categories, rules, and capacities."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Events" },
        ]}
      />

      <EventListClient events={events} categories={categories} />
    </div>
  );
}
