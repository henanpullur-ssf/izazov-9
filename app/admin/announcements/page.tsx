import React from "react";
import { getAnnouncements } from "@/actions/announcements";
import { PageHeader } from "@/components/ui/PageHeader";
import { AnnouncementsManagementClient } from "@/components/announcements/AnnouncementsManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const res = await getAnnouncements(false);
  const announcements = res.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements & Broadcasts"
        description="Publish urgent notices, schedule updates, and bulletins to participants and spectators."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Announcements" },
        ]}
      />

      <AnnouncementsManagementClient announcements={announcements} />
    </div>
  );
}
