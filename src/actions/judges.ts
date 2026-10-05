"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getJudges() {
  try {
    const judges = await prisma.judge.findMany({
      include: {
        user: true,
        assignments: {
          include: {
            event: {
              include: { venue: true },
            },
          },
        },
        scores: {
          include: {
            event: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: judges };
  } catch (error) {
    console.error("Failed to fetch judges:", error);
    return { success: false, error: "Failed to fetch judges" };
  }
}

export async function createJudge(data: {
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  organization?: string;
}) {
  try {
    let user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          phone: data.phone?.trim() || null,
          role: "JUDGE",
        },
      });
    }

    const judge = await prisma.judge.upsert({
      where: { userId: user.id },
      update: {
        designation: data.designation?.trim() || null,
        organization: data.organization?.trim() || null,
      },
      create: {
        userId: user.id,
        designation: data.designation?.trim() || null,
        organization: data.organization?.trim() || null,
      },
      include: {
        user: true,
      },
    });

    revalidatePath("/admin/judges");
    return { success: true, data: judge };
  } catch (error) {
    console.error("Failed to create judge:", error);
    return { success: false, error: "Failed to create judge" };
  }
}

export async function assignJudgeToEvent(judgeId: string, eventId: string) {
  try {
    const assignment = await prisma.judgeAssignment.upsert({
      where: {
        judgeId_eventId: { judgeId, eventId },
      },
      update: {},
      create: {
        judgeId,
        eventId,
      },
      include: {
        event: true,
      },
    });

    revalidatePath("/admin/judges");
    revalidatePath("/admin/scoring");

    return { success: true, data: assignment };
  } catch (error) {
    console.error("Failed to assign judge to event:", error);
    return { success: false, error: "Failed to assign judge to event" };
  }
}

export async function removeJudgeAssignment(judgeId: string, eventId: string) {
  try {
    await prisma.judgeAssignment.delete({
      where: {
        judgeId_eventId: { judgeId, eventId },
      },
    });

    revalidatePath("/admin/judges");
    revalidatePath("/admin/scoring");

    return { success: true };
  } catch (error) {
    console.error("Failed to remove judge assignment:", error);
    return { success: false, error: "Failed to remove judge assignment" };
  }
}
