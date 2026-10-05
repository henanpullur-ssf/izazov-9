import React from "react";
import { getHouses, getUsers } from "@/actions/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsManagementClient, type HouseItem, type UserItem } from "@/components/settings/SettingsManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [housesRes, usersRes] = await Promise.all([
    getHouses(),
    getUsers(),
  ]);

  const houses = housesRes.data || [];
  const users = usersRes.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Settings & Houses"
        description="Configure festival factions, manage user access levels, and initialize default datasets."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
      />

      <SettingsManagementClient
        houses={houses as unknown as HouseItem[]}
        users={users as unknown as UserItem[]}
      />
    </div>
  );
}
