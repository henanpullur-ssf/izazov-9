"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { RegistrationStatus } from "@/lib/constants";
import { assertPermission } from "@/lib/auth-helpers";

export async function getRegistrations(filters?: {
  eventId?: string;
  status?: string;
  search?: string;
}) {
  try {
    const authCheck = await assertPermission("registrations.view");
  if (!authCheck.success) {
  return { success: false, error: authCheck.error };
  }
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


async function validateRegistrationInput(
  eventId: string,
  participantIds: string[],
  excludeRegistrationId?: string
): Promise<string | null> {
  if (!participantIds || participantIds.length === 0) {
    return "At least one participant is required";
  }

  if (new Set(participantIds).size !== participantIds.length) {
    return "Duplicate participants are not allowed";
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, maxParticipants: true },
  });

  if (!event) {
    return "Selected event was not found";
  }

  if (
    event.maxParticipants !== null &&
    participantIds.length > event.maxParticipants
  ) {
    return `This event allows a maximum of ${event.maxParticipants} participants per registration`;
  }

  const registrationCount = await prisma.registration.count({
    where: {
      eventId,
      ...(excludeRegistrationId
        ? { id: { not: excludeRegistrationId } }
        : {}),
    },
  });

  if (registrationCount >= 3) {
    return "An event can have a maximum of 3 registrations";
  }

  const participantCount = await prisma.participant.count({
    where: { id: { in: participantIds } },
  });

  if (participantCount !== participantIds.length) {
    return "One or more selected participants were not found";
  }

  return null;
}

export async function createRegistration(data: {
  eventId: string;
  teamName?: string;
  participantIds: string[];
  status?: RegistrationStatus;
}) {

  try {
    const authCheck = await assertPermission("registrations.manage");
    if (!authCheck.success) {
    return { success: false, error: authCheck.error };
    }
    const validationError = await validateRegistrationInput(
      data.eventId,
      data.participantIds
    );

    if (validationError) {
      return { success: false, error: validationError };
    }

   // Generate a unique registration number
const year = new Date().getFullYear();
let registration: any;

for (let attempt = 0; attempt < 5; attempt++) {
  const latestRegistration = await prisma.registration.findFirst({
    where: {
      registrationNumber: {
        startsWith: `REG-${year}-`,
      },
    },
    orderBy: {
      registrationNumber: "desc",
    },
    select: {
      registrationNumber: true,
    },
  });

  const lastNumber = latestRegistration
    ? Number(latestRegistration.registrationNumber.split("-").pop())
    : 0;

  const regNumber = `REG-${year}-${String(lastNumber + 1).padStart(4, "0")}`;

  try {
    registration = await prisma.registration.create({
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

    break;
  } catch (error: any) {
    if (error.code === "P2002" && attempt < 4) {
      continue;
    }
    throw error;
  }
}

if (!registration) {
  throw new Error("Could not generate a unique registration number");
}

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
    const authCheck = await assertPermission("registrations.manage");
    if (!authCheck.success) {
    return { success: false, error: authCheck.error };
    }
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
    const authCheck = await assertPermission("registrations.manage");
    if (!authCheck.success) {
    return { success: false, error: authCheck.error };
    }
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

export async function updateRegistration(
  id: string,
  data: {
    teamName?: string;
    participantIds: string[];
    status: RegistrationStatus;
  }
) {
  try {
    const authCheck = await assertPermission("registrations.manage");
    if (!authCheck.success) {
    return { success: false, error: authCheck.error };
    }
    const existing = await prisma.registration.findUnique({
      where: { id },
      include: {
        scores: true,
        results: true,
      },
    });

    if (!existing) {
      return { success: false, error: "Registration not found" };
    }


const validationError = await validateRegistrationInput(
  existing.eventId,
  data.participantIds,
  id
);

if (validationError) {
  return { success: false, error: validationError };
}


    // Avoid changing participants when scores or results already exist.
    const hasJudgingData =
      existing.scores.length > 0 || existing.results.length > 0;

    if (hasJudgingData) {
      const currentParticipants = await prisma.registrationParticipant.findMany({
        where: { registrationId: id },
        select: { participantId: true },
      });

      const currentIds = currentParticipants
        .map((p) => p.participantId)
        .sort();
      const requestedIds = [...data.participantIds].sort();

      if (
        currentIds.length !== requestedIds.length ||
        currentIds.some((participantId, index) => participantId !== requestedIds[index])
      ) {
        return {
          success: false,
          error:
            "Participants cannot be changed because this registration already has scores or results. Team name and status can still be updated.",
        };
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.registration.update({
        where: { id },
        data: {
          teamName: data.teamName?.trim() || null,
          status: data.status,
        },
      });

      if (!hasJudgingData) {
        await tx.registrationParticipant.deleteMany({
          where: { registrationId: id },
        });

        await tx.registrationParticipant.createMany({
          data: data.participantIds.map((participantId) => ({
            registrationId: id,
            participantId,
          })),
          skipDuplicates: true,
        });
      }

      return tx.registration.findUnique({
        where: { id },
        include: {
          event: true,
          participants: { include: { participant: true } },
          scores: true,
          results: true,
        },
      });
    });

    revalidatePath("/admin/registrations");
    revalidatePath("/admin/events");
    revalidatePath("/admin");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update registration:", error);
    return {
      success: false,
      error: "Failed to update registration",
    };
  }
}
