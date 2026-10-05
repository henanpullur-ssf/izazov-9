"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSchedules(filters?: {
  venueId?: string;
  eventId?: string;
  category?: string;
  date?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.venueId && filters.venueId !== "ALL") {
      where.venueId = filters.venueId;
    }

    if (filters?.eventId && filters.eventId !== "ALL") {
      where.eventId = filters.eventId;
    }

    if (filters?.category && filters.category !== "ALL") {
      where.event = { category: filters.category };
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        event: {
          include: { venue: true },
        },
        venue: true,
      },
      orderBy: { startTime: "asc" },
    });

    return { success: true, data: schedules };
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return { success: false, error: "Failed to fetch schedules" };
  }
}

export async function createSchedule(data: {
  eventId: string;
  venueId?: string;
  startTime: string | Date;
  endTime: string | Date;
  notes?: string;
}) {
  try {
    const schedule = await prisma.schedule.create({
      data: {
        eventId: data.eventId,
        venueId: data.venueId || null,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
    revalidatePath("/events");
    revalidatePath("/");

    return { success: true, data: schedule };
  } catch (error) {
    console.error("Failed to create schedule:", error);
    return { success: false, error: "Failed to create schedule" };
  }
}

export async function updateSchedule(
  id: string,
  data: {
    eventId?: string;
    venueId?: string;
    startTime?: string | Date;
    endTime?: string | Date;
    notes?: string;
  }
) {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.eventId !== undefined) updateData.eventId = data.eventId;
    if (data.venueId !== undefined) updateData.venueId = data.venueId || null;
    if (data.startTime !== undefined)
      updateData.startTime = new Date(data.startTime);
    if (data.endTime !== undefined) updateData.endTime = new Date(data.endTime);
    if (data.notes !== undefined)
      updateData.notes = data.notes?.trim() || null;

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
    revalidatePath("/events");
    revalidatePath("/");

    return { success: true, data: schedule };
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return { success: false, error: "Failed to update schedule" };
  }
}

export async function deleteSchedule(id: string) {
  try {
    await prisma.schedule.delete({
      where: { id },
    });

    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
    revalidatePath("/events");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    return { success: false, error: "Failed to delete schedule" };
  }
}
