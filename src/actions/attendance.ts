"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function getAttendance(eventId?: string) {
  try {
    const where: Record<string, unknown> = {};
    if (eventId && eventId !== "ALL") {
      where.eventId = eventId;
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        participant: {
          include: { house: true },
        },
        event: true,
        checkedBy: true,
      },
      orderBy: { scannedAt: "desc" },
    });

    return { success: true, data: records };
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return { success: false, error: "Failed to fetch attendance" };
  }
}

export async function recordAttendance(data: {
  participantId: string;
  eventId: string;
  status: AttendanceStatus;
  notes?: string;
}) {
  try {
    const currentUser = await getCurrentUser();

    const record = await prisma.attendance.upsert({
      where: {
        participantId_eventId: {
          participantId: data.participantId,
          eventId: data.eventId,
        },
      },
      update: {
        status: data.status,
        notes: data.notes?.trim() || null,
        scannedAt: new Date(),
        checkedById: currentUser?.id || null,
      },
      create: {
        participantId: data.participantId,
        eventId: data.eventId,
        status: data.status,
        notes: data.notes?.trim() || null,
        checkedById: currentUser?.id || null,
      },
      include: {
        participant: true,
        event: true,
      },
    });

    revalidatePath("/admin/attendance");
    revalidatePath("/admin");

    return { success: true, data: record };
  } catch (error) {
    console.error("Failed to record attendance:", error);
    return { success: false, error: "Failed to record attendance" };
  }
}

export async function checkInByQrToken(data: {
  qrToken: string;
  eventId: string;
  notes?: string;
}) {
  try {
    const participant = await prisma.participant.findUnique({
      where: { qrToken: data.qrToken.trim() },
    });

    if (!participant) {
      return { success: false, error: "Invalid QR Token / Participant not found" };
    }

    const currentUser = await getCurrentUser();

    const record = await prisma.attendance.upsert({
      where: {
        participantId_eventId: {
          participantId: participant.id,
          eventId: data.eventId,
        },
      },
      update: {
        status: AttendanceStatus.PRESENT,
        notes: data.notes?.trim() || "QR Check-in",
        scannedAt: new Date(),
        checkedById: currentUser?.id || null,
      },
      create: {
        participantId: participant.id,
        eventId: data.eventId,
        status: AttendanceStatus.PRESENT,
        notes: data.notes?.trim() || "QR Check-in",
        checkedById: currentUser?.id || null,
      },
      include: {
        participant: true,
        event: true,
      },
    });

    revalidatePath("/admin/attendance");
    revalidatePath("/admin");

    return { success: true, data: record };
  } catch (error) {
    console.error("Failed QR check-in:", error);
    return { success: false, error: "Failed to process check-in" };
  }
}
