export const FEST_NAME = "IZAZOV 9.0";
export const FEST_TAGLINE = "Campus Fest Operations & Management Platform";
export const FEST_DATES = "MARCH 2026";

export const EVENT_CATEGORIES = [
  "Technical",
  "Cultural",
  "Literary",
  "Arts & Design",
  "Gaming & Esports",
  "Management",
  "Sports",
  "Workshops",
] as const;

export const EVENT_STATUSES = [
  "DRAFT",
  "UPCOMING",
  "LIVE",
  "COMPLETED",
  "CANCELLED",
] as const;

export const EVENT_TYPES = ["INDIVIDUAL", "GROUP"] as const;

export const REGISTRATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "DISQUALIFIED",
] as const;

export const ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "LATE"] as const;

export const ANNOUNCEMENT_PRIORITIES = [
  "NORMAL",
  "IMPORTANT",
  "URGENT",
] as const;

export const SCORE_STATUSES = ["DRAFT", "SUBMITTED", "LOCKED"] as const;

export const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "COORDINATOR",
  "VOLUNTEER",
  "JUDGE",
  "PARTICIPANT",
] as const;

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}
