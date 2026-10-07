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

export const GRADE_OPTIONS = [
  "A+",
  "A",
  "B+",
  "B",
  "C",
  "Other",
] as const;

export const PRIZE_LEVELS = [
  "1st Prize",
  "2nd Prize",
  "3rd Prize",
  "Consolation",
  "Special Prize",
  "No Prize",
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

export interface SiteSettingsData {
  id?: string;
  siteName: string;
  shortName: string;
  tagline: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;

  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  cardColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;

  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroImageUrl?: string | null;
  showFeaturedEvents: boolean;
  showAnnouncements: boolean;
  showResults: boolean;
  showSchedule: boolean;
  showStats: boolean;

  aboutTitle: string;
  aboutDescription: string;
  aboutImageUrl?: string | null;

  contactEmail: string;
  contactPhone: string;
  contactWhatsApp?: string | null;
  contactAddress: string;

  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  whatsappUrl?: string | null;
  websiteUrl?: string | null;

  festName: string;
  edition: string;
  startDate: string;
  endDate: string;
  venueName: string;
  venueLocation: string;

  showEvents: boolean;
  showScheduleNav: boolean;
  showVenuesNav: boolean;
  showAnnouncementsNav: boolean;
  showResultsNav: boolean;
  showAboutNav: boolean;

  footerText: string;
  copyrightText: string;

  metaTitle: string;
  metaDescription: string;
  ogImageUrl?: string | null;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  siteName: "IZAZOV 9.0",
  shortName: "IZAZOV",
  tagline: "Where Talent Meets Glory",
  logoUrl: null,
  faviconUrl: null,

  primaryColor: "#931827",
  backgroundColor: "#000000",
  surfaceColor: "#231F20",
  cardColor: "#111011",
  textColor: "#FFFFFF",
  mutedTextColor: "#B8B8B8",
  borderColor: "#2D292A",

  heroTitle: "IGNITE THE ARENA",
  heroSubtitle: "THE 9TH EDITION • MARCH 2026",
  heroDescription:
    "The flagship campus festival uniting cultural spectacles, 24-hour hackathons, esports battles, literary arenas, and the four-house championship.",
  heroButtonText: "Explore Events",
  heroButtonLink: "/events",
  heroImageUrl: null,
  showFeaturedEvents: true,
  showAnnouncements: true,
  showResults: true,
  showSchedule: true,
  showStats: true,

  aboutTitle: "About IZAZOV 9.0",
  aboutDescription:
    "IZAZOV is the premier annual inter-collegiate cultural and technical festival. Over three days, students from across departments and institutions compete in cultural showcases, algorithmic battles, parliamentary debates, and gaming tournaments.",
  aboutImageUrl: null,

  contactEmail: "fest@izazov9.com",
  contactPhone: "+91 98765 43210",
  contactWhatsApp: "+91 98765 43210",
  contactAddress: "Main Campus Arena, University City",

  instagramUrl: "https://instagram.com",
  facebookUrl: "https://facebook.com",
  youtubeUrl: "https://youtube.com",
  whatsappUrl: "https://wa.me/919876543210",
  websiteUrl: "https://izazov9.com",

  festName: "IZAZOV",
  edition: "9.0",
  startDate: "MARCH 25, 2026",
  endDate: "MARCH 28, 2026",
  venueName: "Main Campus Arena",
  venueLocation: "Block A & Central Amphitheatre",

  showEvents: true,
  showScheduleNav: true,
  showVenuesNav: true,
  showAnnouncementsNav: true,
  showResultsNav: true,
  showAboutNav: true,

  footerText:
    "IZAZOV 9.0 is the official campus festival operations and competition management system.",
  copyrightText: "© 2026 IZAZOV 9.0 Fest Committee. All rights reserved.",

  metaTitle: "IZAZOV 9.0 — Campus Fest Operations & Management Platform",
  metaDescription:
    "Official festival management platform for IZAZOV 9.0 — explore competitions, schedules, live results, and official announcements.",
  ogImageUrl: null,
};
