"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getParticipants(filters?: {
  search?: string;
  houseId?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { participantId: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.houseId && filters.houseId !== "ALL") {
      where.houseId = filters.houseId;
    }

    const participants = await prisma.participant.findMany({
      where,
      include: {
        house: true,
        _count: {
          select: {
            registrations: true,
            attendance: true,
            results: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: participants };
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    return { success: false, error: "Failed to fetch participants" };
  }
}

export async function getParticipantById(id: string) {
  try {
    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        house: true,
        registrations: {
          include: {
            registration: {
              include: {
                event: {
                  include: { venue: true },
                },
              },
            },
          },
        },
        attendance: {
          include: {
            event: true,
            checkedBy: true,
          },
        },
        results: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!participant) {
      return { success: false, error: "Participant not found" };
    }

    return { success: true, data: participant };
  } catch (error) {
    console.error("Failed to fetch participant:", error);
    return { success: false, error: "Failed to fetch participant" };
  }
}

export async function createParticipant(data: {
  participantId: string;
  name: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  address?: string;
  houseId?: string;
}) {
  try {
    const existing = await prisma.participant.findUnique({
      where: { participantId: data.participantId.trim() },
    });

    if (existing) {
      return { success: false, error: "Participant ID already registered" };
    }

    const participant = await prisma.participant.create({
      data: {
        participantId: data.participantId.trim(),
        name: data.name.trim(),
        gender: data.gender || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        houseId: data.houseId || null,
      },
    });

    revalidatePath("/admin/participants");
    revalidatePath("/admin");

    return { success: true, data: participant };
  } catch (error) {
    console.error("Failed to create participant:", error);
    return { success: false, error: "Failed to create participant" };
  }
}

export async function updateParticipant(
  id: string,
  data: {
    participantId?: string;
    name?: string;
    gender?: string;
    dateOfBirth?: string;
    phone?: string;
    email?: string;
    address?: string;
    houseId?: string;
  }
) {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.participantId !== undefined)
      updateData.participantId = data.participantId.trim();
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.gender !== undefined) updateData.gender = data.gender || null;
    if (data.dateOfBirth !== undefined)
      updateData.dateOfBirth = data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : null;
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    if (data.email !== undefined) updateData.email = data.email?.trim() || null;
    if (data.address !== undefined)
      updateData.address = data.address?.trim() || null;
    if (data.houseId !== undefined) updateData.houseId = data.houseId || null;

    const participant = await prisma.participant.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/participants");
    revalidatePath(`/admin/participants/${id}`);
    revalidatePath("/admin");

    return { success: true, data: participant };
  } catch (error) {
    console.error("Failed to update participant:", error);
    return { success: false, error: "Failed to update participant" };
  }
}

export async function deleteParticipant(id: string) {
  try {
    await prisma.participant.delete({
      where: { id },
    });

    revalidatePath("/admin/participants");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete participant:", error);
    return { success: false, error: "Failed to delete participant" };
  }
}
