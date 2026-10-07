"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Shield,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  HeartHandshake,
  Trophy,
  Megaphone,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/Table";
import {
  createStaffUser,
  updateStaffUser,
  toggleStaffStatus,
  resetStaffPassword,
  deleteStaffUser,
} from "@/actions/users";
import {
  MODULE_DEFINITIONS,
  getUserAssignedModules,
} from "@/lib/permissions";
import { formatDate } from "@/lib/constants";

export interface StaffUserItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  permissions: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    checkedAttendance: number;
    volunteerTasks: number;
  };
}

const AVAILABLE_MODULES = [
  {
    key: "fest_management",
    name: "Fest Management",
    icon: Sparkles,
    color: "text-red-400 bg-red-950/40 border-red-800",
    description: "Events, Categories, Teams, Participants, Registrations, Venues, Schedule",
    subItems: ["Events", "Categories", "Teams", "Participants", "Registrations", "Venues", "Schedule"],
  },
  {
    key: "operations",
    name: "Operations",
    icon: HeartHandshake,
    color: "text-blue-400 bg-blue-950/40 border-blue-800",
    description: "Attendance Scanning, Volunteer Assignments, Judges Panel",
    subItems: ["Attendance Check-in", "Volunteer Duties", "Judges Panel"],
  },
  {
    key: "competition",
    name: "Competition",
    icon: Trophy,
    color: "text-amber-400 bg-amber-950/40 border-amber-800",
    description: "Scoring Input, Results Publishing, Championship Scoreboard",
    subItems: ["Scoring Entry", "Results Publishing", "Championship Scoreboard"],
  },
  {
    key: "communication",
    name: "Communication",
    icon: Megaphone,
    color: "text-emerald-400 bg-emerald-950/40 border-emerald-800",
    description: "Broadcasts, Live Feed, Announcements",
    subItems: ["Festival Announcements & Feeds"],
  },
];

export function StaffManagementClient({
  users,
  currentUserId,
}: {
  users: StaffUserItem[];
  currentUserId: string;
}) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create / Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VOLUNTEER");
  const [isActive, setIsActive] = useState(true);
  const [selectedModules, setSelectedModules] = useState<string[]>(["dashboard"]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Password Reset Modal State
  const [resetModalUser, setResetModalUser] = useState<StaffUserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<StaffUserItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function resetForm() {
    setEditingUserId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("VOLUNTEER");
    setIsActive(true);
    setSelectedModules(["dashboard"]);
    setFormError("");
    setExpandedModule(null);
  }

  function openCreateModal() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditModal(user: StaffUserItem) {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setIsActive(user.isActive);

    const modules = getUserAssignedModules(user.permissions);
    if (!modules.includes("dashboard")) {
      modules.push("dashboard");
    }
    setSelectedModules(modules);
    setFormError("");
    setExpandedModule(null);
    setIsFormOpen(true);
  }

  function toggleModuleSelection(key: string) {
    if (key === "dashboard") return; // Dashboard is always granted
    setSelectedModules((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (editingUserId) {
        const res = await updateStaffUser(editingUserId, {
          name,
          email,
          role,
          isActive,
          moduleKeys: selectedModules,
          newPassword: password.trim() ? password : undefined,
        });

        if (!res.success) {
          setFormError(res.error || "Failed to update staff account.");
        } else {
          setIsFormOpen(false);
          resetForm();
          router.refresh();
        }
      } else {
        const res = await createStaffUser({
          name,
          email,
          password,
          role,
          isActive,
          moduleKeys: selectedModules,
        });

        if (!res.success) {
          setFormError(res.error || "Failed to create staff account.");
        } else {
          setIsFormOpen(false);
          resetForm();
          router.refresh();
        }
      }
    } catch {
      setFormError("An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleToggleStatus(user: StaffUserItem) {
    try {
      await toggleStaffStatus(user.id, !user.isActive);
      router.refresh();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetModalUser) return;
    if (!newPassword || newPassword.length < 6) {
      setResetError("Password must be at least 6 characters.");
      return;
    }

    setResetLoading(true);
    setResetError("");

    try {
      const res = await resetStaffPassword(resetModalUser.id, newPassword);
      if (!res.success) {
        setResetError(res.error || "Failed to reset password");
      } else {
        setResetModalUser(null);
        setNewPassword("");
        router.refresh();
      }
    } catch {
      setResetError("An unexpected error occurred");
    } finally {
      setResetLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      await deleteStaffUser(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();

    return users.filter((u) => {
      const matchesSearch =
        q === "" ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && u.isActive) ||
        (statusFilter === "INACTIVE" && !u.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131213] p-4 rounded-2xl border border-[#272425]">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name or email..."
            className="w-full rounded-xl border border-[#332f30] bg-[#0c0b0c] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#931827]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by Role"
            className="rounded-xl border border-[#332f30] bg-[#181617] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#931827] cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="VOLUNTEER">Staff / Volunteer</option>
            <option value="COORDINATOR">Coordinator</option>
            <option value="JUDGE">Judge</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="rounded-xl border border-[#332f30] bg-[#181617] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#931827] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Deactivated Only</option>
          </select>

          <Button onClick={openCreateModal} size="sm" className="gap-1.5 whitespace-nowrap">
            <UserPlus className="w-4 h-4" />
            <span>Create Staff Account</span>
          </Button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-zinc-500" />}
          title="No staff accounts found"
          description={
            search || roleFilter !== "ALL" || statusFilter !== "ALL"
              ? "Try adjusting your search criteria or role filters."
              : "Create staff and volunteer accounts with custom module access."
          }
          actionLabel="Create Staff Account"
          onAction={openCreateModal}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Staff Member</TableHeader>
                <TableHeader>Role</TableHeader>
                <TableHeader>Assigned Modules</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Created</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => {
                const assignedModules = getUserAssignedModules(user.permissions);
                const isSuper = user.role === "SUPER_ADMIN";
                const isSelf = user.id === currentUserId;

                return (
                  <TableRow key={user.id} className={!user.isActive ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {user.name}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-mono">
                          {user.email}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-700">
                          <ShieldCheck className="w-3 h-3" />
                          SUPER ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          <Shield className="w-3 h-3 text-zinc-400" />
                          {user.role === "VOLUNTEER" ? "STAFF / VOLUNTEER" : user.role}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {isSuper ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Full Access (All Modules)
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="neutral" className="text-[10px]">
                            Dashboard
                          </Badge>
                          {assignedModules.map((mKey) => {
                            const def = MODULE_DEFINITIONS[mKey];
                            if (!def || mKey === "dashboard") return null;
                            return (
                              <span
                                key={mKey}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1f1a1c] text-zinc-300 border border-[#382f32]"
                              >
                                {def.name}
                              </span>
                            );
                          })}
                          {assignedModules.length === 0 || (assignedModules.length === 1 && assignedModules[0] === "dashboard") ? (
                            <span className="text-[10px] text-zinc-500 italic">
                              Dashboard only
                            </span>
                          ) : null}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400">
                          <XCircle className="w-3.5 h-3.5" />
                          Deactivated
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-zinc-400 font-mono">
                        {formatDate(user.createdAt)}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          title="Edit Permissions & Details"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setResetModalUser(user);
                            setNewPassword("");
                            setResetError("");
                          }}
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </Button>

                        {!isSelf && !isSuper && (
                          <Button
                            variant={user.isActive ? "outline" : "primary"}
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            title={user.isActive ? "Deactivate Account" : "Activate Account"}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        )}

                        {!isSelf && !isSuper && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(user)}
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit Staff Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          resetForm();
        }}
        title={editingUserId ? "Edit Staff Account & Permissions" : "Create New Staff Account"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveUser} className="space-y-5">
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fasil Rahman"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@izazov9.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Account Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              helperText="Determines base permission boundaries"
            >
              <option value="VOLUNTEER">Staff / Volunteer (Module Controlled)</option>
              <option value="COORDINATOR">Coordinator</option>
              <option value="JUDGE">Judge</option>
              {editingUserId && <option value="SUPER_ADMIN">Super Admin (Full Access)</option>}
            </Select>

            <Input
              label={editingUserId ? "Reset Password (Leave blank to keep)" : "Account Password"}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editingUserId ? "New password (optional)" : "Min 6 characters"}
              required={!editingUserId}
              helperText="Securely hashed with bcrypt"
            />
          </div>

          {/* Module Access Assignment Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Module Access Permissions
                </p>
                <p className="text-[11px] text-zinc-400">
                  Select which operations sections this account can view and manage.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {selectedModules.filter((m) => m !== "dashboard").length} modules active
              </span>
            </div>

            {/* Dashboard Default */}
            <div className="p-3 rounded-xl border border-[#2b2728] bg-[#0e0d0e] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Dashboard</p>
                  <p className="text-[10px] text-zinc-400">
                    Standard access granted to all active staff accounts.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled={true}
                aria-label="Dashboard permission"
                className="rounded border-[#383334] text-emerald-600 focus:ring-0 opacity-70 cursor-not-allowed"
              />
            </div>

            {/* Configurable Modules */}
            <div className="space-y-2">
              {AVAILABLE_MODULES.map((mod) => {
                const Icon = mod.icon;
                const isSelected = selectedModules.includes(mod.key);
                const isExpanded = expandedModule === mod.key;

                return (
                  <div
                    key={mod.key}
                    className={`rounded-2xl border transition ${
                      isSelected
                        ? "border-[#931827]/60 bg-[#161214]"
                        : "border-[#262223] bg-[#0d0c0d] hover:border-[#383234]"
                    }`}
                  >
                    <div className="p-3.5 flex items-center justify-between gap-3">
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => toggleModuleSelection(mod.key)}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${mod.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            {mod.name}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {mod.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setExpandedModule(isExpanded ? null : mod.key)}
                          className="p-1 text-zinc-400 hover:text-zinc-200 transition text-[11px] flex items-center gap-0.5"
                          title="View sub-permissions"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleModuleSelection(mod.key)}
                          aria-label={`Toggle access for ${mod.name}`}
                          className="rounded border-[#383334] text-[#931827] focus:ring-[#931827] w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Expandable Sub-Items Breakdown */}
                    {isExpanded && (
                      <div className="px-4 pb-3.5 pt-1 border-t border-[#252022] text-xs space-y-1.5 bg-[#090809]/60">
                        <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider pt-1">
                          Included Permissions & Sections:
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {mod.subItems.map((item) => (
                            <span
                              key={item}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#1e1a1c] border border-[#302a2c] text-zinc-300"
                            >
                              ✓ {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Status */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#2b2728] bg-[#141213] cursor-pointer hover:border-[#403b3c] transition">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-[#383334] text-[#931827] focus:ring-[#931827] w-4 h-4"
              />
              <div>
                <p className="text-xs font-bold text-white">Active Account</p>
                <p className="text-[10px] text-zinc-400">
                  When deactivated, login and access are blocked immediately.
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292526]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={formLoading}>
              {editingUserId ? "Save Changes" : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={Boolean(resetModalUser)}
        onClose={() => {
          setResetModalUser(null);
          setNewPassword("");
          setResetError("");
        }}
        title={`Reset Password • ${resetModalUser?.name}`}
        maxWidth="sm"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          {resetError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300">
              {resetError}
            </div>
          )}

          <p className="text-xs text-zinc-400">
            Enter a new password for <strong className="text-white">{resetModalUser?.email}</strong>. The password will be hashed securely with bcrypt.
          </p>

          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 6 characters"
            required
            autoFocus
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#292526]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetModalUser(null)}
              disabled={resetLoading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={resetLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Account"
        message={`Are you sure you want to permanently remove the account for "${deleteTarget?.name}" (${deleteTarget?.email})?`}
        confirmLabel="Delete Account"
        isLoading={deleteLoading}
      />
    </div>
  );
}
