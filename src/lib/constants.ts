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

export const EventStatus = {
  DRAFT: "DRAFT",
  UPCOMING: "UPCOMING",
  LIVE: "LIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const EVENT_TYPES = ["INDIVIDUAL", "GROUP"] as const;

export const EventType = {
  INDIVIDUAL: "INDIVIDUAL",
  GROUP: "GROUP",
} as const;

export const REGISTRATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "DISQUALIFIED",
] as const;

export const RegistrationStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  DISQUALIFIED: "DISQUALIFIED",
} as const;

export const ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "LATE"] as const;

export const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
} as const;

export const ANNOUNCEMENT_PRIORITIES = [
  "NORMAL",
  "IMPORTANT",
  "URGENT",
] as const;

export const AnnouncementPriority = {
  NORMAL: "NORMAL",
  IMPORTANT: "IMPORTANT",
  URGENT: "URGENT",
} as const;

export const SCORE_STATUSES = ["DRAFT", "SUBMITTED", "LOCKED"] as const;

export const ScoreStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  LOCKED: "LOCKED",
} as const;

export const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "COORDINATOR",
  "VOLUNTEER",
  "JUDGE",
  "PARTICIPANT",
] as const;

export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  COORDINATOR: "COORDINATOR",
  VOLUNTEER: "VOLUNTEER",
  JUDGE: "JUDGE",
  PARTICIPANT: "PARTICIPANT",
} as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];
export type EventType = (typeof EVENT_TYPES)[number];
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];
export type AnnouncementPriority = (typeof ANNOUNCEMENT_PRIORITIES)[number];
export type ScoreStatus = (typeof SCORE_STATUSES)[number];
export type UserRole = (typeof USER_ROLES)[number];

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
