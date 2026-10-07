import React from "react";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { getStaffUsers } from "@/actions/users";
import { StaffManagementClient } from "@/components/users/StaffManagementClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Staff & User Access Control | IZAZOV 9.0",
  description: "Manage staff accounts, assign module permissions, and control operational roles.",
};

export default async function AdminUsersPage() {
  const currentUser = await requireSuperAdmin();
  const staffRes = await getStaffUsers();
  const users = staffRes.success && staffRes.data ? staffRes.data : [];

  return (
    <StaffManagementClient
      users={users}
      currentUserId={currentUser.id || ""}
    />
  );
}
