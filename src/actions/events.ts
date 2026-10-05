"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EventStatus, EventType } from "@/lib/constants";

export async function getEvents(filters?: {
  search?: string;
  category?: string;
  status?: string;
  type?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { code: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.category && filters.category !== "ALL") {
      where.category = filters.category;
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status as EventStatus;
    }

    if (filters?.type && filters.type !== "ALL") {
      where.type = filters.type as EventType;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        venue: true,
        schedules: {
          orderBy: { startTime: "asc" },
        },
        _count: {
          select: {
            registrations: true,
            judges: true,
            results: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: events };
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

export async function getEventById(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        venue: true,
        schedules: {
          include: { venue: true },
          orderBy: { startTime: "asc" },
        },
        coordinators: {
          include: { user: true },
        },
        judges: {
          include: {
            judge: {
              include: { user: true },
            },
          },
        },
        registrations: {
          include: {
            participants: {
              include: {
                participant: {
                  include: { house: true },
                },
              },
            },
          },
        },
        results: {
          include: {
            participant: {
              include: { house: true },
            },
            registration: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    return { success: true, data: event };
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return { success: false, error: "Failed to fetch event" };
  }
}

export async function createEvent(data: {
  code: string;
  name: string;
  description?: string;
  category?: string;
  type?: EventType;
  status?: EventStatus;
  maxParticipants?: number;
  durationMinutes?: number;
  venueId?: string;
}) {
  try {
    // Check if code exists
    const existing = await prisma.event.findUnique({
      where: { code: data.code.toUpperCase().trim() },
    });

    if (existing) {
      return { success: false, error: "Event code already exists" };
    }

    const event = await prisma.event.create({
      data: {
        code: data.code.toUpperCase().trim(),
        name: data.name.trim(),
        description: data.description?.trim() || null,
        category: data.category?.trim() || null,
        type: data.type || EventType.INDIVIDUAL,
        status: data.status || EventStatus.DRAFT,
        maxParticipants: data.maxParticipants ? Number(data.maxParticipants) : null,
        durationMinutes: data.durationMinutes ? Number(data.durationMinutes) : null,
        venueId: data.venueId || null,
      },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/schedule");
    revalidatePath("/");

    return { success: true, data: event };
  } catch (error) {
    console.error("Failed to create event:", error);
    return { success: false, error: "Failed to create event" };
  }
}

export async function updateEvent(
  id: string,
  data: {
    code?: string;
    name?: string;
    description?: string;
    category?: string;
    type?: EventType;
    status?: EventStatus;
    maxParticipants?: number;
    durationMinutes?: number;
    venueId?: string;
  }
) {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.code !== undefined) updateData.code = data.code.toUpperCase().trim();
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined)
      updateData.description = data.description ? data.description.trim() : null;
    if (data.category !== undefined)
      updateData.category = data.category ? data.category.trim() : null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.maxParticipants !== undefined)
      updateData.maxParticipants = data.maxParticipants
        ? Number(data.maxParticipants)
        : null;
    if (data.durationMinutes !== undefined)
      updateData.durationMinutes = data.durationMinutes
        ? Number(data.durationMinutes)
        : null;
    if (data.venueId !== undefined) updateData.venueId = data.venueId || null;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}`);
    revalidatePath("/events");
    revalidatePath(`/events/${id}`);
    revalidatePath("/schedule");
    revalidatePath("/");

    return { success: true, data: event };
  } catch (error) {
    console.error("Failed to update event:", error);
    return { success: false, error: "Failed to update event" };
  }
}

export async function deleteEvent(id: string) {
  try {
    await prisma.event.delete({
      where: { id },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    revalidatePath("/schedule");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}

export async function updateEventStatus(id: string, status: EventStatus) {
  try {
    const event = await prisma.event.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}`);
    revalidatePath("/events");
    revalidatePath("/schedule");
    revalidatePath("/");

    return { success: true, data: event };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Failed to update status" };
  }
}
