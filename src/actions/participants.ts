"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getParticipants(filters?: {
  search?: string;
  houseId?: string;
  sortBy?: "rollNumber" | "name" | "participantId" | "house" | "createdAt";
  sortOrder?: "asc" | "desc";
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { participantId: { contains: filters.search, mode: "insensitive" } },
        { rollNumber: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.houseId && filters.houseId !== "ALL") {
      where.houseId = filters.houseId;
    }

    const sortOrder = filters?.sortOrder || "asc";
    let orderBy: Record<string, unknown> = { createdAt: "desc" };

    if (filters?.sortBy === "name") {
      orderBy = { name: sortOrder };
    } else if (filters?.sortBy === "participantId") {
      orderBy = { participantId: sortOrder };
    } else if (filters?.sortBy === "rollNumber") {
      orderBy = { rollNumber: sortOrder };
    } else if (filters?.sortBy === "house") {
      orderBy = { house: { name: sortOrder } };
    } else if (filters?.sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    }

    const participants = await prisma.participant.findMany({
      where,
      include: {
        house: true,
        results: {
          where: { isPublished: true },
          select: { points: true, totalMarks: true },
        },
        _count: {
          select: {
            registrations: true,
            attendance: true,
            results: true,
          },
        },
      },
      orderBy,
    });

    // Compute total published points for each participant
    const data = participants.map((p) => {
      const totalPoints = p.results.reduce((sum, r) => {
        const pts = r.points !== null ? Number(r.points) : Number(r.totalMarks) || 0;
        return sum + pts;
      }, 0);

      return {
        ...p,
        totalPoints,
      };
    });

    return { success: true, data };
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
            registration: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!participant) {
      return { success: false, error: "Participant not found" };
    }

    // Process results for summary calculations
    const formattedResults = participant.results.map((r) => ({
      ...r,
      points: r.points !== null ? Number(r.points) : Number(r.totalMarks),
      totalMarks: Number(r.totalMarks),
    }));

    // Only published results contribute to points & official summaries
    const publishedResults = formattedResults.filter((r) => r.isPublished);

    const totalPoints = publishedResults.reduce((sum, r) => sum + (r.points || 0), 0);

    const prizeSummary = {
      first: publishedResults.filter((r) => r.prizeLevel === "1st Prize" || r.position === 1).length,
      second: publishedResults.filter((r) => r.prizeLevel === "2nd Prize" || r.position === 2).length,
      third: publishedResults.filter((r) => r.prizeLevel === "3rd Prize" || r.position === 3).length,
      consolation: publishedResults.filter((r) => r.prizeLevel === "Consolation").length,
      special: publishedResults.filter((r) => r.prizeLevel === "Special Prize").length,
      totalPrizes: publishedResults.filter(
        (r) => r.prizeLevel && r.prizeLevel !== "No Prize"
      ).length,
    };

    const gradeSummary: Record<string, number> = {};
    publishedResults.forEach((r) => {
      if (r.grade) {
        gradeSummary[r.grade] = (gradeSummary[r.grade] || 0) + 1;
      }
    });

    return {
      success: true,
      data: {
        ...participant,
        results: formattedResults,
        totalPoints,
        prizeSummary,
        gradeSummary,
      },
    };
  } catch (error) {
    console.error("Failed to fetch participant:", error);
    return { success: false, error: "Failed to fetch participant" };
  }
}

export async function createParticipant(data: {
  participantId: string;
  rollNumber?: string;
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
        rollNumber: data.rollNumber?.trim() || null,
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
    revalidatePath("/admin/teams");
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
    rollNumber?: string;
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
    if (data.rollNumber !== undefined)
      updateData.rollNumber = data.rollNumber ? data.rollNumber.trim() : null;
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
    revalidatePath("/admin/teams");
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
    revalidatePath("/admin/teams");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete participant:", error);
    return { success: false, error: "Failed to delete participant" };
  }
}

