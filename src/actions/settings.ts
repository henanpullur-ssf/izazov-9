"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole, EventType, EventStatus, AnnouncementPriority } from "@prisma/client";

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

    revalidatePath("/admin");
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
