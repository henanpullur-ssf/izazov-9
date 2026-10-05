"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ScoreStatus } from "@prisma/client";

export async function getScores(eventId?: string) {
  try {
    const where: Record<string, unknown> = {};
    if (eventId && eventId !== "ALL") {
      where.eventId = eventId;
    }

    const scores = await prisma.score.findMany({
      where,
      include: {
        event: true,
        judge: {
          include: { user: true },
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
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: scores.map((s) => ({
        ...s,
        marks: Number(s.marks),
        maxMarks: Number(s.maxMarks),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch scores:", error);
    return { success: false, error: "Failed to fetch scores" };
  }
}

export async function submitScore(data: {
  eventId: string;
  registrationId: string;
  judgeId: string;
  marks: number;
  maxMarks?: number;
  remarks?: string;
  status?: ScoreStatus;
}) {
  try {
    const score = await prisma.score.upsert({
      where: {
        registrationId_judgeId: {
          registrationId: data.registrationId,
          judgeId: data.judgeId,
        },
      },
      update: {
        marks: data.marks,
        maxMarks: data.maxMarks ?? 100,
        remarks: data.remarks?.trim() || null,
        status: data.status || ScoreStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      create: {
        eventId: data.eventId,
        registrationId: data.registrationId,
        judgeId: data.judgeId,
        marks: data.marks,
        maxMarks: data.maxMarks ?? 100,
        remarks: data.remarks?.trim() || null,
        status: data.status || ScoreStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    revalidatePath("/admin/scoring");
    revalidatePath("/admin/results");

    return {
      success: true,
      data: {
        ...score,
        marks: Number(score.marks),
        maxMarks: Number(score.maxMarks),
      },
    };
  } catch (error) {
    console.error("Failed to submit score:", error);
    return { success: false, error: "Failed to submit score" };
  }
}

export async function lockScores(eventId: string) {
  try {
    await prisma.score.updateMany({
      where: { eventId },
      data: { status: ScoreStatus.LOCKED },
    });

    revalidatePath("/admin/scoring");
    revalidatePath("/admin/results");

    return { success: true };
  } catch (error) {
    console.error("Failed to lock scores:", error);
    return { success: false, error: "Failed to lock scores" };
  }
}
