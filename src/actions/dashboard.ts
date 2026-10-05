"use server";

import { prisma } from "@/lib/prisma";
import { EventStatus } from "@prisma/client";

export async function getDashboardStats() {
  try {
    const [
      totalParticipants,
      totalEvents,
      upcomingEventsCount,
      liveEventsCount,
      completedEventsCount,
      totalVenues,
      totalVolunteers,
      totalJudges,
      totalRegistrations,
      recentRegistrations,
      upcomingSchedules,
      latestAnnouncements,
      eventsByStatus,
    ] = await Promise.all([
      prisma.participant.count(),
      prisma.event.count(),
      prisma.event.count({ where: { status: EventStatus.UPCOMING } }),
      prisma.event.count({ where: { status: EventStatus.LIVE } }),
      prisma.event.count({ where: { status: EventStatus.COMPLETED } }),
      prisma.venue.count(),
      prisma.volunteer.count(),
      prisma.judge.count(),
      prisma.registration.count(),
      prisma.registration.findMany({
        take: 5,
        orderBy: { registeredAt: "desc" },
        include: {
          event: true,
          participants: {
            include: {
              participant: {
                include: { house: true },
              },
            },
          },
        },
      }),
      prisma.schedule.findMany({
        take: 5,
        where: {
          startTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // from today onwards
          },
        },
        orderBy: { startTime: "asc" },
        include: {
          event: true,
          venue: true,
        },
      }),
      prisma.announcement.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    return {
      success: true,
      data: {
        totalParticipants,
        totalEvents,
        upcomingEventsCount,
        liveEventsCount,
        completedEventsCount,
        totalVenues,
        totalVolunteers,
        totalJudges,
        totalRegistrations,
        recentRegistrations,
        upcomingSchedules,
        latestAnnouncements,
        eventsByStatus,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard statistics",
      data: {
        totalParticipants: 0,
        totalEvents: 0,
        upcomingEventsCount: 0,
        liveEventsCount: 0,
        completedEventsCount: 0,
        totalVenues: 0,
        totalVolunteers: 0,
        totalJudges: 0,
        totalRegistrations: 0,
        recentRegistrations: [],
        upcomingSchedules: [],
        latestAnnouncements: [],
        eventsByStatus: [],
      },
    };
  }
}
