"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@/lib/constants";
import { getCurrentUser, assertPermission } from "@/lib/auth-helpers";

export async function getAttendance(eventId?: string) {
  try {
    const where = eventId && eventId !== "ALL" ? { eventId } : {};

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

/**
 * Returns the list of participants registered for a given event,
 * enriched with their current attendance status for that event.
 * Only participants linked via RegistrationParticipant → Registration are returned.
 */
export async function getEventRegisteredParticipants(eventId: string) {
  if (!eventId || eventId === "ALL") {
    return { success: false, error: "A specific event must be selected." };
  }

  try {
    // Gather all participant IDs registered for this event (via any registration)
    const registrationParticipants = await prisma.registrationParticipant.findMany({
      where: {
        registration: { eventId },
      },
      select: {
        participantId: true,
        participant: {
          select: {
            id: true,
            participantId: true,
            name: true,
            house: { select: { name: true } },
          },
        },
      },
    });

    // De-duplicate by participantId (a participant could be in multiple registrations for the same event)
    const seen = new Set<string>();
    const participants: {
      id: string;
      participantId: string;
      name: string;
      houseName: string | null;
    }[] = [];

    for (const rp of registrationParticipants) {
      if (!seen.has(rp.participantId)) {
        seen.add(rp.participantId);
        participants.push({
          id: rp.participant.id,
          participantId: rp.participant.participantId,
          name: rp.participant.name,
          houseName: rp.participant.house?.name ?? null,
        });
      }
    }

    // Fetch current attendance records for this event in one query
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        eventId,
        participantId: { in: participants.map((p) => p.id) },
      },
      select: {
        participantId: true,
        status: true,
        scannedAt: true,
      },
    });

    const attendanceMap = new Map(
      attendanceRecords.map((a) => [a.participantId, a])
    );

    const result = participants.map((p) => {
      const att = attendanceMap.get(p.id);
      return {
        ...p,
        attendanceStatus: att?.status ?? null,
        scannedAt: att?.scannedAt ?? null,
      };
    });

    // Sort: not-checked-in first, then by name
    result.sort((a, b) => {
      const aPresent = a.attendanceStatus === "PRESENT";
      const bPresent = b.attendanceStatus === "PRESENT";
      if (aPresent !== bPresent) return aPresent ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch registered participants:", error);
    return { success: false, error: "Failed to load participant roster." };
  }
}

/**
 * Manually checks in a single participant for an event.
 *
 * Security:
 * - Requires `attendance.manage` permission.
 * - Validates that the participant is actually registered for the event
 *   (via RegistrationParticipant → Registration) — never trusts the client.
 * - If the participant already has a PRESENT record, returns alreadyPresent: true
 *   without overwriting the existing timestamp, notes, or checker info.
 * - Uses the unique(participantId, eventId) constraint for safe concurrent writes.
 */
export async function manualCheckIn(data: {
  participantId: string;
  eventId: string;
}) {
  // 1. Permission check
  const auth = await assertPermission("attendance.manage");
  if (!auth.success) {
    return { success: false, error: auth.error };
  }
  const currentUser = auth.user;

  const { participantId, eventId } = data;

  if (!participantId || !eventId) {
    return { success: false, error: "Participant and event are required." };
  }

  try {
    // 2. Validate that the participant is registered for this event (server-side)
    const registration = await prisma.registrationParticipant.findFirst({
      where: {
        participantId,
        registration: { eventId },
      },
      select: { id: true },
    });

    if (!registration) {
      return {
        success: false,
        error: "This participant is not registered for the selected event.",
      };
    }

    // 3. Atomic insert with conditional conflict resolution — no read-then-write gap.
    //
    // Behaviour by case:
    //   • No existing record        → INSERT runs            → RETURNING yields 1 row  → alreadyPresent: false
    //   • Existing status = PRESENT → DO UPDATE WHERE false  → UPDATE skipped          → RETURNING yields 0 rows → alreadyPresent: true
    //                                  (scannedAt / notes / checkedById are NOT touched)
    //   • Existing status = ABSENT/LATE → DO UPDATE WHERE true → UPDATE runs           → RETURNING yields 1 row  → alreadyPresent: false
    //
    // Concurrent requests: both reach the INSERT simultaneously; PostgreSQL serialises
    // them on the unique index.  The second request always sees the row already PRESENT
    // and returns 0 rows from RETURNING → alreadyPresent: true with zero field mutation.
    //
    // All dynamic values are parameterised via Prisma's tagged-template literal;
    // the enum literal and 'Manual check-in' string are hard-coded SQL constants.
    const newId = randomUUID();
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO "Attendance" (id, "participantId", "eventId", status, "scannedAt", notes, "checkedById")
      VALUES (
        ${newId},
        ${participantId},
        ${eventId},
        'PRESENT'::"AttendanceStatus",
        NOW(),
        'Manual check-in',
        ${currentUser?.id ?? null}
      )
      ON CONFLICT ("participantId", "eventId") DO UPDATE
        SET
          status        = 'PRESENT'::"AttendanceStatus",
          "scannedAt"   = NOW(),
          notes         = 'Manual check-in',
          "checkedById" = EXCLUDED."checkedById"
        WHERE "Attendance".status <> 'PRESENT'::"AttendanceStatus"
      RETURNING id
    `;

    // 0 rows → conflict with an existing PRESENT record; original record untouched.
    // 1 row  → new insert, or upgrade from ABSENT/LATE to PRESENT.
    if (rows.length === 0) {
      return {
        success: true,
        alreadyPresent: true,
        message: "Participant is already marked as present.",
      };
    }

    revalidatePath("/admin/attendance");
    revalidatePath("/admin");

    return { success: true, alreadyPresent: false };
  } catch (error) {
    console.error("Failed manual check-in:", error);
    return { success: false, error: "Failed to record check-in. Please try again." };
  }
}
