"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { RegistrationStatus } from "@/lib/constants";

export async function getRegistrations(filters?: {
  eventId?: string;
  status?: string;
  search?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.eventId && filters.eventId !== "ALL") {
      where.eventId = filters.eventId;
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status as RegistrationStatus;
    }

    if (filters?.search) {
      where.OR = [
        { registrationNumber: { contains: filters.search, mode: "insensitive" } },
        { teamName: { contains: filters.search, mode: "insensitive" } },
        {
          participants: {
            some: {
              participant: {
                name: { contains: filters.search, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        event: {
          include: { venue: true },
        },
        participants: {
          include: {
            participant: {
              include: { house: true },
            },
          },
        },
        scores: {
          include: {
            judge: {
              include: { user: true },
            },
          },
        },
        results: true,
      },
      orderBy: { registeredAt: "desc" },
    });

    return { success: true, data: registrations };
  } catch (error) {
    console.error("Failed to fetch registrations:", error);
    return { success: false, error: "Failed to fetch registrations" };
  }
}

export async function createRegistration(data: {
  eventId: string;
  teamName?: string;
  participantIds: string[];
  status?: RegistrationStatus;
}) {
  try {
    if (!data.participantIds || data.participantIds.length === 0) {
      return { success: false, error: "At least one participant is required" };
    }

    // Generate unique registration number
    const count = await prisma.registration.count();
    const regNumber = `REG-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const registration = await prisma.registration.create({
      data: {
        registrationNumber: regNumber,
        eventId: data.eventId,
        teamName: data.teamName?.trim() || null,
        status: data.status || RegistrationStatus.CONFIRMED,
        participants: {
          create: data.participantIds.map((pId) => ({
            participantId: pId,
          })),
        },
      },
      include: {
        event: true,
        participants: {
          include: { participant: true },
        },
      },
    });

    revalidatePath("/admin/registrations");
    revalidatePath("/admin/events");
    revalidatePath("/admin");
    revalidatePath("/events");

    return { success: true, data: registration };
  } catch (error) {
    console.error("Failed to create registration:", error);
    return { success: false, error: "Failed to create registration" };
  }
}

export async function updateRegistrationStatus(
  id: string,
  status: RegistrationStatus
) {
  try {
    const registration = await prisma.registration.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/registrations");
    revalidatePath("/admin");

    return { success: true, data: registration };
  } catch (error) {
    console.error("Failed to update registration status:", error);
    return { success: false, error: "Failed to update registration status" };
  }
}

export async function deleteRegistration(id: string) {
  try {
    await prisma.registration.delete({
      where: { id },
    });

    revalidatePath("/admin/registrations");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete registration:", error);
    return { success: false, error: "Failed to delete registration" };
  }
}
