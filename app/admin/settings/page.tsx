import React from "react";
import { getSiteSettings, getHouses, getUsers } from "@/actions/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  SettingsManagementClient,
  type HouseItem,
  type UserItem,
} from "@/components/settings/SettingsManagementClient";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settingsRes, housesRes, usersRes] = await Promise.all([
    getSiteSettings(),
    getHouses(),
    getUsers(),
  ]);

  const siteSettings = settingsRes.data || DEFAULT_SITE_SETTINGS;
  const houses = housesRes.data || [];
  const users = usersRes.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Customization & Platform Settings"
        description="Live brand control, colors, homepage sections, contact info, factions, and access levels."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings & Customization" },
        ]}
      />

      <SettingsManagementClient
        initialSettings={siteSettings}
        houses={houses as unknown as HouseItem[]}
        users={users as unknown as UserItem[]}
      />
    </div>
  );
}
