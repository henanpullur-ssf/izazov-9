"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Trash2,
  Database,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  createHouse,
  deleteHouse,
  updateUserRole,
  seedInitialData,
} from "@/actions/settings";
import { USER_ROLES } from "@/lib/constants";
import { UserRole } from "@prisma/client";

export interface HouseItem {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  _count?: {
    participants: number;
  };
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
}

export function SettingsManagementClient({
  houses,
  users,
}: {
  houses: HouseItem[];
  users: UserItem[];
}) {
  const router = useRouter();

  // House Form
  const [isCreateHouseOpen, setIsCreateHouseOpen] = useState(false);
  const [houseName, setHouseName] = useState("");
  const [houseShortName, setHouseShortName] = useState("");
  const [houseDescription, setHouseDescription] = useState("");
  const [houseLoading, setHouseLoading] = useState(false);
  const [houseError, setHouseError] = useState("");

  // Seed Data State
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // House Delete
  const [deleteTargetHouse, setDeleteTargetHouse] = useState<HouseItem | null>(null);

  async function handleCreateHouse(e: React.FormEvent) {
    e.preventDefault();
    setHouseLoading(true);
    setHouseError("");

    try {
      const res = await createHouse({
        name: houseName,
        shortName: houseShortName,
        description: houseDescription,
      });

      if (!res.success) {
        setHouseError(res.error || "Failed to create house");
      } else {
        setIsCreateHouseOpen(false);
        setHouseName("");
        setHouseShortName("");
        setHouseDescription("");
        router.refresh();
      }
    } catch {
      setHouseError("An unexpected error occurred");
    } finally {
      setHouseLoading(false);
    }
  }

  async function handleDeleteHouse() {
    if (!deleteTargetHouse) return;
    try {
      await deleteHouse(deleteTargetHouse.id);
      setDeleteTargetHouse(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    try {
      await updateUserRole(userId, newRole);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSeedDemoData() {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await seedInitialData();
      if (res.success) {
        setSeedMessage("Demo festival data populated successfully!");
        router.refresh();
      } else {
        setSeedMessage("Failed to seed: " + res.error);
      }
    } catch {
      setSeedMessage("Unexpected error while seeding.");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Seed Demo Data Banner */}
      <Card className="p-5 border-[#931827]/40 bg-gradient-to-r from-[#171213] to-[#121112]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#931827]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Festival Quick Initialization
              </h3>
            </div>
            <p className="text-xs text-zinc-400 max-w-xl">
              Populate default Houses (Phoenix, Pegasus, Orion, Hydra), Venues (Auditorium, Turing Lab, Amphitheatre), core Events, and initial announcements if the system is fresh.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleSeedDemoData}
            isLoading={seeding}
            className="shrink-0 gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Initialize Sample Data</span>
          </Button>
        </div>

        {seedMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
            {seedMessage}
          </div>
        )}
      </Card>

      {/* Houses Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Campus House System
            </h2>
            <p className="text-xs text-zinc-500">
              Houses compete for the overall IZAZOV 9.0 Championship Trophy
            </p>
          </div>
          <Button
            onClick={() => setIsCreateHouseOpen(true)}
            size="sm"
            className="gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add House</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {houses.map((h) => (
            <Card key={h.id} className="p-4 space-y-3 hover:border-[#383334] transition">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">{h.name}</h4>
                  {h.shortName && (
                    <Badge variant="primary" className="text-[10px] mt-1">
                      {h.shortName}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setDeleteTargetHouse(h)}
                  className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                  title="Delete house"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-zinc-400 line-clamp-2">
                {h.description || "Campus competitive faction."}
              </p>

              <div className="pt-2 border-t border-[#232021] text-xs text-zinc-400 flex items-center justify-between">
                <span>Participants</span>
                <span className="font-bold text-white">
                  {h._count?.participants || 0}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* User Accounts & Role Control */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            User Accounts & Role Permissions
          </h2>
          <p className="text-xs text-zinc-500">
            Manage system access for Super Admins, Event Coordinators, Judges, and Crew
          </p>
        </div>

        <Card>
          <CardContent className="p-0 divide-y divide-[#231f20]">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#161415] transition"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {u.name}
                    </span>
                    <Badge variant="primary" className="text-[10px]">
                      {u.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400">{u.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 hidden sm:inline">
                    Role:
                  </span>
                  <select
                    value={u.role}
                    onChange={(e) =>
                      handleRoleChange(u.id, e.target.value as UserRole)
                    }
                    disabled={u.role === "SUPER_ADMIN"}
                    aria-label="User Role"
                    className="rounded-xl border border-[#383334] bg-[#0e0d0e] px-3 py-1.5 text-xs text-white outline-none focus:border-[#931827] cursor-pointer disabled:opacity-50"
                  >
                    {USER_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Add House Modal */}
      <Modal
        isOpen={isCreateHouseOpen}
        onClose={() => setIsCreateHouseOpen(false)}
        title="Create New House / Faction"
        maxWidth="md"
      >
        <form onSubmit={handleCreateHouse} className="space-y-4">
          {houseError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
              {houseError}
            </div>
          )}

          <Input
            label="House Name"
            value={houseName}
            onChange={(e) => setHouseName(e.target.value)}
            placeholder="e.g. Phoenix"
            required
          />

          <Input
            label="Short Code / Abbreviation"
            value={houseShortName}
            onChange={(e) => setHouseShortName(e.target.value)}
            placeholder="e.g. PHX"
          />

          <Textarea
            label="Description & Motto"
            value={houseDescription}
            onChange={(e) => setHouseDescription(e.target.value)}
            placeholder="e.g. House of Flames & Innovation"
            rows={2}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292526]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateHouseOpen(false)}
              disabled={houseLoading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={houseLoading}>
              Create House
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete House Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetHouse)}
        onClose={() => setDeleteTargetHouse(null)}
        onConfirm={handleDeleteHouse}
        title="Delete House"
        message={`Are you sure you want to delete House "${deleteTargetHouse?.name}"?`}
        confirmLabel="Delete House"
      />
    </div>
  );
}
