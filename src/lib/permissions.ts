/**
 * Centralized Role & Module Permission Definitions for IZAZOV 9.0
 */

export interface PermissionDefinition {
  key: string;
  name: string;
  description?: string;
}

export interface ModuleDefinition {
  id: string;
  key: string;
  name: string;
  description: string;
  permissions: PermissionDefinition[];
  subItems: { title: string; href: string; permission: string }[];
}

export const MODULE_DEFINITIONS: Record<string, ModuleDefinition> = {
  dashboard: {
    id: "dashboard",
    key: "dashboard",
    name: "Dashboard",
    description: "Festival overview, key metrics, and activity feeds",
    permissions: [
      { key: "dashboard.view", name: "View Dashboard Metrics", description: "Access to overview dashboard" },
    ],
    subItems: [
      { title: "Dashboard", href: "/admin", permission: "dashboard.view" },
    ],
  },
  fest_management: {
    id: "fest_management",
    key: "fest_management",
    name: "Fest Management",
    description: "Events, categories, teams, participants, registrations, venues, and schedule",
    permissions: [
      { key: "events.view", name: "View Events", description: "Browse competition and workshop listings" },
      { key: "events.create", name: "Create Events", description: "Add new competitions and events" },
      { key: "events.edit", name: "Edit Events", description: "Modify rules, status, max limits" },
      { key: "events.delete", name: "Delete Events", description: "Remove competition records" },
      { key: "categories.view", name: "View Categories", description: "Browse event categories" },
      { key: "categories.manage", name: "Manage Categories", description: "Add, edit, reorder categories" },
      { key: "teams.view", name: "View Teams", description: "View team profiles and member lists" },
      { key: "teams.manage", name: "Manage Teams", description: "Assign managers, edit team details" },
      { key: "participants.view", name: "View Participants", description: "Browse participant directory and passes" },
      { key: "participants.manage", name: "Manage Participants", description: "Register, edit, or remove participants" },
      { key: "registrations.view", name: "View Registrations", description: "Browse competition registrations" },
      { key: "registrations.manage", name: "Manage Registrations", description: "Confirm, cancel, or edit entries" },
      { key: "venues.view", name: "View Venues", description: "Browse stages and competition halls" },
      { key: "venues.manage", name: "Manage Venues", description: "Add, edit, or configure venues" },
      { key: "schedule.view", name: "View Schedule", description: "View festival timeline and time slots" },
      { key: "schedule.manage", name: "Manage Schedule", description: "Create, adjust, or delete slots" },
    ],
    subItems: [
      { title: "Events", href: "/admin/events", permission: "events.view" },
      { title: "Categories", href: "/admin/categories", permission: "categories.view" },
      { title: "Teams", href: "/admin/teams", permission: "teams.view" },
      { title: "Participants", href: "/admin/participants", permission: "participants.view" },
      { title: "Registrations", href: "/admin/registrations", permission: "registrations.view" },
      { title: "Venues", href: "/admin/venues", permission: "venues.view" },
      { title: "Schedule", href: "/admin/schedule", permission: "schedule.view" },
    ],
  },
  operations: {
    id: "operations",
    key: "operations",
    name: "Operations",
    description: "Attendance check-ins, volunteer task assignments, and judges panel",
    permissions: [
      { key: "attendance.view", name: "View Attendance", description: "Inspect check-in history" },
      { key: "attendance.manage", name: "Manage Attendance", description: "Scan QR passes, record attendance" },
      { key: "volunteers.view", name: "View Volunteers", description: "Browse volunteer assignments" },
      { key: "volunteers.manage", name: "Manage Volunteers", description: "Assign volunteers to venues and duties" },
      { key: "judges.view", name: "View Judges", description: "Browse judging panel list" },
      { key: "judges.manage", name: "Manage Judges", description: "Add judges, assign to competitions" },
    ],
    subItems: [
      { title: "Attendance", href: "/admin/attendance", permission: "attendance.view" },
      { title: "Volunteers", href: "/admin/volunteers", permission: "volunteers.view" },
      { title: "Judges", href: "/admin/judges", permission: "judges.view" },
    ],
  },
  competition: {
    id: "competition",
    key: "competition",
    name: "Competition",
    description: "Judge score entry, official results publishing, and championship scoreboard",
    permissions: [
      { key: "scoring.view", name: "View Scoring", description: "Inspect submitted judge scorecards" },
      { key: "scoring.manage", name: "Manage Scoring", description: "Submit, edit, or lock judge scores" },
      { key: "results.view", name: "View Results", description: "Inspect competition podiums & points" },
      { key: "results.manage", name: "Manage & Publish Results", description: "Enter manual points, select grades/prizes, toggle publish" },
      { key: "championship.view", name: "View Championship", description: "View live team and confidential individual standings" },
    ],
    subItems: [
      { title: "Scoring", href: "/admin/scoring", permission: "scoring.view" },
      { title: "Results", href: "/admin/results", permission: "results.view" },
      { title: "Championship", href: "/admin/championship", permission: "championship.view" },
    ],
  },
  communication: {
    id: "communication",
    key: "communication",
    name: "Communication",
    description: "Festival broadcasts, notifications, and public announcements",
    permissions: [
      { key: "announcements.view", name: "View Announcements", description: "Browse announcements feed" },
      { key: "announcements.manage", name: "Manage Announcements", description: "Publish, pin, edit, or delete announcements" },
    ],
    subItems: [
      { title: "Announcements", href: "/admin/announcements", permission: "announcements.view" },
    ],
  },
};

export type ModuleKey = keyof typeof MODULE_DEFINITIONS;

export interface UserAuthContext {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  isActive?: boolean;
  permissions?: string[] | null;
}

/**
 * Checks if the user has the SUPER_ADMIN role.
 */
export function isSuperAdmin(user?: UserAuthContext | null): boolean {
  if (!user || user.isActive === false) return false;
  return user.role === "SUPER_ADMIN";
}

/**
 * Checks if the user has a specific granular permission or module permission.
 */
export function hasPermission(
  user: UserAuthContext | null | undefined,
  permissionKey: string
): boolean {
  if (!user || user.isActive === false) return false;
  if (user.role === "SUPER_ADMIN") return true;

  const permissions = user.permissions || [];

  // 1. Direct permission match
  if (permissions.includes(permissionKey)) return true;

  // 2. Direct module grant match (e.g. user has "fest_management" which grants all "fest_management.*" and related sub-permissions)
  for (const mod of Object.values(MODULE_DEFINITIONS)) {
    if (permissions.includes(mod.key)) {
      if (mod.permissions.some((p) => p.key === permissionKey)) {
        return true;
      }
    }
  }

  // 3. Prefix match (e.g. "events.manage" implies "events.create", "events.edit", "events.delete", "events.view")
  const prefix = permissionKey.split(".")[0];
  if (prefix) {
    if (permissions.includes(`${prefix}.manage`)) return true;
    if (permissions.includes(prefix)) return true;
  }

  return false;
}

/**
 * Checks if the user has access to an entire module or any permission within that module.
 */
export function hasModuleAccess(
  user: UserAuthContext | null | undefined,
  moduleKey: string
): boolean {
  if (!user || user.isActive === false) return false;
  if (user.role === "SUPER_ADMIN") return true;

  const permissions = user.permissions || [];

  // Direct module key presence
  if (permissions.includes(moduleKey)) return true;

  // Check if user has ANY permission belonging to this module
  const mod = MODULE_DEFINITIONS[moduleKey];
  if (mod) {
    return mod.permissions.some((p) => permissions.includes(p.key));
  }

  return false;
}

/**
 * Checks if the user has any of the listed permissions.
 */
export function hasAnyPermission(
  user: UserAuthContext | null | undefined,
  permissionKeys: string[]
): boolean {
  if (!user || user.isActive === false) return false;
  if (user.role === "SUPER_ADMIN") return true;

  return permissionKeys.some((p) => hasPermission(user, p));
}

/**
 * Returns all granular permissions implied by a list of selected module keys.
 */
export function getPermissionsForModules(moduleKeys: string[]): string[] {
  const permSet = new Set<string>();

  moduleKeys.forEach((key) => {
    permSet.add(key);
    const mod = MODULE_DEFINITIONS[key];
    if (mod) {
      mod.permissions.forEach((p) => permSet.add(p.key));
    }
  });

  return Array.from(permSet);
}

/**
 * Infers which modules are active for a user from their permissions array.
 */
export function getUserAssignedModules(permissions: string[] = []): string[] {
  const activeModules = new Set<string>();

  Object.values(MODULE_DEFINITIONS).forEach((mod) => {
    if (permissions.includes(mod.key)) {
      activeModules.add(mod.key);
    } else if (mod.permissions.some((p) => permissions.includes(p.key))) {
      activeModules.add(mod.key);
    }
  });

  return Array.from(activeModules);
}
