"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getResults(eventId?: string) {
  try {
    const where: Record<string, unknown> = {};
    if (eventId && eventId !== "ALL") {
      where.eventId = eventId;
    }

    const results = await prisma.result.findMany({
      where,
      include: {
        event: {
          include: { venue: true },
        },
        participant: {
          include: { house: true },
        },
        registration: {
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
      },
      orderBy: [
        { position: "asc" },
        { totalMarks: "desc" },
      ],
    });

    return {
      success: true,
      data: results.map((r) => ({
        ...r,
        totalMarks: Number(r.totalMarks),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch results:", error);
    return { success: false, error: "Failed to fetch results" };
  }
}

export async function saveResult(data: {
  eventId: string;
  registrationId: string;
  participantId?: string;
  position?: number;
  totalMarks: number;
  isWinner?: boolean;
}) {
  try {
    // If a result exists for this registration in this event, update it
    const existing = await prisma.result.findFirst({
      where: {
        eventId: data.eventId,
        registrationId: data.registrationId,
      },
    });

    let result;
    if (existing) {
      result = await prisma.result.update({
        where: { id: existing.id },
        data: {
          participantId: data.participantId || null,
          position: data.position ? Number(data.position) : null,
          totalMarks: data.totalMarks,
          isWinner: data.isWinner !== undefined ? data.isWinner : data.position === 1,
        },
      });
    } else {
      result = await prisma.result.create({
        data: {
          eventId: data.eventId,
          registrationId: data.registrationId,
          participantId: data.participantId || null,
          position: data.position ? Number(data.position) : null,
          totalMarks: data.totalMarks,
          isWinner: data.isWinner !== undefined ? data.isWinner : data.position === 1,
        },
      });
    }

    revalidatePath("/admin/results");
    revalidatePath("/results");
    revalidatePath("/");

    return {
      success: true,
      data: {
        ...result,
        totalMarks: Number(result.totalMarks),
      },
    };
  } catch (error) {
    console.error("Failed to save result:", error);
    return { success: false, error: "Failed to save result" };
  }
}

export async function deleteResult(id: string) {
  try {
    await prisma.result.delete({
      where: { id },
    });

    revalidatePath("/admin/results");
    revalidatePath("/results");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete result:", error);
    return { success: false, error: "Failed to delete result" };
  }
}
