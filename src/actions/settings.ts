"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  UserRole,
  EventType,
  EventStatus,
  AnnouncementPriority,
  SiteSettingsData,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth-helpers";
import { ensureDefaultCategories } from "@/actions/categories";

export async function getHouses() {
  try {
    const houses = await prisma.house.findMany({
      include: {
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: houses };
  } catch (error) {
    console.error("Failed to fetch houses:", error);
    return { success: false, error: "Failed to fetch houses" };
  }
}

export async function createHouse(data: {
  name: string;
  shortName?: string;
  description?: string;
}) {
  try {
    const existing = await prisma.house.findUnique({
      where: { name: data.name.trim() },
    });

    if (existing) {
      return { success: false, error: "House with this name already exists" };
    }

    const house = await prisma.house.create({
      data: {
        name: data.name.trim(),
        shortName: data.shortName?.trim() || null,
        description: data.description?.trim() || null,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/participants");

    return { success: true, data: house };
  } catch (error) {
    console.error("Failed to create house:", error);
    return { success: false, error: "Failed to create house" };
  }
}

export async function deleteHouse(id: string) {
  try {
    await prisma.house.delete({
      where: { id },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/participants");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete house:", error);
    return { success: false, error: "Failed to delete house" };
  }
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/settings");
    return { success: true, data: user };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function seedInitialData() {
  try {
    // 1. Seed Houses if none exist
    const houseCount = await prisma.house.count();
    if (houseCount === 0) {
      await prisma.house.createMany({
        data: [
          { name: "Phoenix", shortName: "PHX", description: "House of Flames & Innovation" },
          { name: "Pegasus", shortName: "PEG", description: "House of Vision & Culture" },
          { name: "Orion", shortName: "ORN", description: "House of Strategy & Intellect" },
          { name: "Hydra", shortName: "HYD", description: "House of Resilience & Power" },
        ],
      });
    }

    // 2. Seed Venues if none exist
    const venueCount = await prisma.venue.count();
    let venueAuditorium, venueLab, venueOpenStage;
    if (venueCount === 0) {
      venueAuditorium = await prisma.venue.create({
        data: {
          name: "Grand Auditorium",
          location: "Block A - Main Campus",
          description: "Central air-conditioned auditorium with 800 seats and concert audio.",
          capacity: 800,
          isActive: true,
        },
      });
      venueLab = await prisma.venue.create({
        data: {
          name: "Turing Computing Lab",
          location: "Tech Building 3rd Floor",
          description: "High-performance workstations for coding, gaming, and robotics.",
          capacity: 120,
          isActive: true,
        },
      });
      venueOpenStage = await prisma.venue.create({
        data: {
          name: "Amphitheatre Open Stage",
          location: "Central Courtyard",
          description: "Outdoor stage for dance, battle of bands, and drama.",
          capacity: 1500,
          isActive: true,
        },
      });
    } else {
      const allVenues = await prisma.venue.findMany();
      venueAuditorium = allVenues[0];
      venueLab = allVenues[1] || allVenues[0];
      venueOpenStage = allVenues[2] || allVenues[0];
    }

    // 3. Seed Events if none exist
    const eventCount = await prisma.event.count();
    if (eventCount === 0) {
      const hackathon = await prisma.event.create({
        data: {
          code: "EV-HACK",
          name: "CodePulse: 24h Hackathon",
          description: "Build innovative AI and Web3 solutions to solve real campus problems. Mentorship and food provided.",
          category: "Technical",
          type: EventType.GROUP,
          status: EventStatus.LIVE,
          maxParticipants: 4,
          durationMinutes: 1440,
          venueId: venueLab?.id || null,
        },
      });

      const dance = await prisma.event.create({
        data: {
          code: "EV-DANCE",
          name: "Rhythm Clash: Western Group Dance",
          description: "High-octane group choreography showdown with synchronization and theme execution.",
          category: "Cultural",
          type: EventType.GROUP,
          status: EventStatus.UPCOMING,
          maxParticipants: 12,
          durationMinutes: 180,
          venueId: venueOpenStage?.id || null,
        },
      });

      const debate = await prisma.event.create({
        data: {
          code: "EV-DEBATE",
          name: "Verbal Arena: Parliamentary Debate",
          description: "Test rhetoric, argumentative logic, and policy rebuttals in this prestigious tournament.",
          category: "Literary",
          type: EventType.INDIVIDUAL,
          status: EventStatus.UPCOMING,
          maxParticipants: 1,
          durationMinutes: 120,
          venueId: venueAuditorium?.id || null,
        },
      });

      const valorant = await prisma.event.create({
        data: {
          code: "EV-ESPORTS",
          name: "FragFest: Valorant Championship",
          description: "5v5 tactical shooter showdown on LAN with live shoutcasting.",
          category: "Gaming & Esports",
          type: EventType.GROUP,
          status: EventStatus.UPCOMING,
          maxParticipants: 5,
          durationMinutes: 240,
          venueId: venueLab?.id || null,
        },
      });

      // 4. Seed Schedule for events
      const now = new Date();
      const today10am = new Date(now);
      today10am.setHours(10, 0, 0, 0);

      const tomorrow11am = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      tomorrow11am.setHours(11, 0, 0, 0);
      const tomorrow2pm = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      tomorrow2pm.setHours(14, 0, 0, 0);

      await prisma.schedule.create({
        data: {
          eventId: hackathon.id,
          venueId: venueLab?.id || null,
          startTime: today10am,
          endTime: new Date(today10am.getTime() + 24 * 60 * 60 * 1000),
          notes: "Round 1 Pitching starts at 2:00 PM.",
        },
      });

      await prisma.schedule.create({
        data: {
          eventId: dance.id,
          venueId: venueOpenStage?.id || null,
          startTime: tomorrow11am,
          endTime: tomorrow2pm,
          notes: "Sound checks from 9:30 AM.",
        },
      });

      await prisma.schedule.create({
        data: {
          eventId: debate.id,
          venueId: venueAuditorium?.id || null,
          startTime: tomorrow11am,
          endTime: tomorrow2pm,
          notes: "Preliminary motion announcements.",
        },
      });

      await prisma.schedule.create({
        data: {
          eventId: valorant.id,
          venueId: venueLab?.id || null,
          startTime: today10am,
          endTime: tomorrow11am,
          notes: "LAN brackets and warmup lobbies.",
        },
      });
    }

    // 5. Seed Announcements if none exist
    const announcementCount = await prisma.announcement.count();
    if (announcementCount === 0) {
      await prisma.announcement.create({
        data: {
          title: "Welcome to IZAZOV 9.0 — Fest Portal is Live!",
          content: "Welcome participants, coordinators, and guests. Check your registered event schedules and stay tuned for live leaderboard updates.",
          priority: AnnouncementPriority.IMPORTANT,
          isPublished: true,
          isPinned: true,
          publishedAt: new Date(),
        },
      });

      await prisma.announcement.create({
        data: {
          title: "CodePulse Hackathon Check-in Open at Turing Lab",
          content: "All registered teams are requested to report with student IDs for seat allocation and kit distribution.",
          priority: AnnouncementPriority.NORMAL,
          isPublished: true,
          isPinned: false,
          publishedAt: new Date(),
        },
      });
    }

    // 6. Ensure default categories exist
    await ensureDefaultCategories();

    revalidatePath("/admin");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/events");
    revalidatePath("/admin/venues");
    revalidatePath("/admin/settings");
    revalidatePath("/events");
    revalidatePath("/schedule");
    revalidatePath("/announcements");
    revalidatePath("/");

    return { success: true, message: "Initial demo data initialized successfully!" };
  } catch (error) {
    console.error("Failed to seed initial data:", error);
    return { success: false, error: "Failed to initialize demo data" };
  }
}

function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex.trim());
}

function sanitizeUrl(url?: string | null): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  if (/^(https?:\/\/|\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export async function getSiteSettings(): Promise<{ success: boolean; data: SiteSettingsData }> {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        ...DEFAULT_SITE_SETTINGS,
      },
    });

    return { success: true, data: settings as SiteSettingsData };
  } catch (error) {
    console.warn("Could not load SiteSettings from database, falling back to defaults:", error);
    return { success: true, data: DEFAULT_SITE_SETTINGS };
  }
}

export async function updateSiteSettings(data: Partial<SiteSettingsData>) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized: Only Admins can modify website settings" };
    }

    // Validate colors
    const colors = {
      primaryColor: data.primaryColor && isValidHex(data.primaryColor) ? data.primaryColor : undefined,
      backgroundColor: data.backgroundColor && isValidHex(data.backgroundColor) ? data.backgroundColor : undefined,
      surfaceColor: data.surfaceColor && isValidHex(data.surfaceColor) ? data.surfaceColor : undefined,
      cardColor: data.cardColor && isValidHex(data.cardColor) ? data.cardColor : undefined,
      textColor: data.textColor && isValidHex(data.textColor) ? data.textColor : undefined,
      mutedTextColor: data.mutedTextColor && isValidHex(data.mutedTextColor) ? data.mutedTextColor : undefined,
      borderColor: data.borderColor && isValidHex(data.borderColor) ? data.borderColor : undefined,
    };

    const updatePayload: Record<string, string | boolean | null | undefined> = {
      ...colors,
      siteName: data.siteName?.trim(),
      shortName: data.shortName?.trim(),
      tagline: data.tagline?.trim(),
      logoUrl: sanitizeUrl(data.logoUrl),
      faviconUrl: sanitizeUrl(data.faviconUrl),

      heroTitle: data.heroTitle?.trim(),
      heroSubtitle: data.heroSubtitle?.trim(),
      heroDescription: data.heroDescription?.trim(),
      heroButtonText: data.heroButtonText?.trim(),
      heroButtonLink: sanitizeUrl(data.heroButtonLink) || "/events",
      heroImageUrl: sanitizeUrl(data.heroImageUrl),
      showFeaturedEvents: data.showFeaturedEvents,
      showAnnouncements: data.showAnnouncements,
      showResults: data.showResults,
      showSchedule: data.showSchedule,
      showStats: data.showStats,

      aboutTitle: data.aboutTitle?.trim(),
      aboutDescription: data.aboutDescription?.trim(),
      aboutImageUrl: sanitizeUrl(data.aboutImageUrl),

      contactEmail: data.contactEmail?.trim(),
      contactPhone: data.contactPhone?.trim(),
      contactWhatsApp: data.contactWhatsApp?.trim() || null,
      contactAddress: data.contactAddress?.trim(),

      instagramUrl: sanitizeUrl(data.instagramUrl),
      facebookUrl: sanitizeUrl(data.facebookUrl),
      youtubeUrl: sanitizeUrl(data.youtubeUrl),
      whatsappUrl: sanitizeUrl(data.whatsappUrl),
      websiteUrl: sanitizeUrl(data.websiteUrl),

      festName: data.festName?.trim(),
      edition: data.edition?.trim(),
      startDate: data.startDate?.trim(),
      endDate: data.endDate?.trim(),
      venueName: data.venueName?.trim(),
      venueLocation: data.venueLocation?.trim(),

      showEvents: data.showEvents,
      showScheduleNav: data.showScheduleNav,
      showVenuesNav: data.showVenuesNav,
      showAnnouncementsNav: data.showAnnouncementsNav,
      showResultsNav: data.showResultsNav,
      showAboutNav: data.showAboutNav,

      footerText: data.footerText?.trim(),
      copyrightText: data.copyrightText?.trim(),

      metaTitle: data.metaTitle?.trim(),
      metaDescription: data.metaDescription?.trim(),
      ogImageUrl: sanitizeUrl(data.ogImageUrl),
    };

    // Remove undefined
    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: updatePayload,
      create: {
        id: "default",
        ...DEFAULT_SITE_SETTINGS,
        ...updatePayload,
      },
    });

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath("/schedule");
    revalidatePath("/venues");
    revalidatePath("/announcements");
    revalidatePath("/results");
    revalidatePath("/about");
    revalidatePath("/admin");
    revalidatePath("/admin/settings");

    return { success: true, data: settings as SiteSettingsData };
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return { success: false, error: "Failed to update site settings" };
  }
}

export async function resetSiteSettings() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized: Only Admins can reset website settings" };
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: DEFAULT_SITE_SETTINGS,
      create: {
        id: "default",
        ...DEFAULT_SITE_SETTINGS,
      },
    });

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath("/schedule");
    revalidatePath("/venues");
    revalidatePath("/announcements");
    revalidatePath("/results");
    revalidatePath("/about");
    revalidatePath("/admin");
    revalidatePath("/admin/settings");

    return { success: true, data: settings as SiteSettingsData };
  } catch (error) {
    console.error("Failed to reset site settings:", error);
    return { success: false, error: "Failed to reset site settings" };
  }
}
