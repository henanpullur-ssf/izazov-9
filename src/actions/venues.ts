"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getVenues() {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        events: {
          select: { id: true, name: true, code: true, status: true },
        },
        schedules: {
          include: {
            event: true,
          },
          orderBy: { startTime: "asc" },
        },
        _count: {
          select: { events: true, schedules: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: venues };
  } catch (error) {
    console.error("Failed to fetch venues:", error);
    return { success: false, error: "Failed to fetch venues" };
  }
}

export async function createVenue(data: {
  name: string;
  location?: string;
  description?: string;
  capacity?: number;
  imageUrl?: string;
  isActive?: boolean;
}) {
  try {
    const existing = await prisma.venue.findUnique({
      where: { name: data.name.trim() },
    });

    if (existing) {
      return { success: false, error: "Venue with this name already exists" };
    }

    const venue = await prisma.venue.create({
      data: {
        name: data.name.trim(),
        location: data.location?.trim() || null,
        description: data.description?.trim() || null,
        capacity: data.capacity ? Number(data.capacity) : null,
        imageUrl: data.imageUrl?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    revalidatePath("/admin/venues");
    revalidatePath("/venues");
    revalidatePath("/schedule");

    return { success: true, data: venue };
  } catch (error) {
    console.error("Failed to create venue:", error);
    return { success: false, error: "Failed to create venue" };
  }
}

export async function updateVenue(
  id: string,
  data: {
    name?: string;
    location?: string;
    description?: string;
    capacity?: number;
    imageUrl?: string;
    isActive?: boolean;
  }
) {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.location !== undefined)
      updateData.location = data.location?.trim() || null;
    if (data.description !== undefined)
      updateData.description = data.description?.trim() || null;
    if (data.capacity !== undefined)
      updateData.capacity = data.capacity ? Number(data.capacity) : null;
    if (data.imageUrl !== undefined)
      updateData.imageUrl = data.imageUrl?.trim() || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const venue = await prisma.venue.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/venues");
    revalidatePath("/venues");
    revalidatePath("/schedule");

    return { success: true, data: venue };
  } catch (error) {
    console.error("Failed to update venue:", error);
    return { success: false, error: "Failed to update venue" };
  }
}

export async function deleteVenue(id: string) {
  try {
    await prisma.venue.delete({
      where: { id },
    });

    revalidatePath("/admin/venues");
    revalidatePath("/venues");
    revalidatePath("/schedule");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete venue:", error);
    return { success: false, error: "Failed to delete venue" };
  }
}
