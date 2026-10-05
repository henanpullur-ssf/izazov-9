"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getVolunteers() {
  try {
    const volunteers = await prisma.volunteer.findMany({
      include: {
        user: true,
        assignments: {
          include: {
            event: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: volunteers };
  } catch (error) {
    console.error("Failed to fetch volunteers:", error);
    return { success: false, error: "Failed to fetch volunteers" };
  }
}

export async function assignVolunteer(data: {
  volunteerId: string;
  userId: string;
  eventId?: string;
  duty?: string;
  venueId?: string;
}) {
  try {
    const assignment = await prisma.volunteerAssignment.create({
      data: {
        volunteerId: data.volunteerId,
        userId: data.userId,
        eventId: data.eventId || null,
        duty: data.duty?.trim() || null,
        venueId: data.venueId || null,
      },
      include: {
        event: true,
      },
    });

    revalidatePath("/admin/volunteers");
    revalidatePath("/admin");

    return { success: true, data: assignment };
  } catch (error) {
    console.error("Failed to assign volunteer:", error);
    return { success: false, error: "Failed to assign volunteer" };
  }
}

export async function updateVolunteerAssignmentStatus(
  assignmentId: string,
  type: "in" | "out"
) {
  try {
    const updateData: Record<string, unknown> = {};
    if (type === "in") {
      updateData.checkedInAt = new Date();
    } else {
      updateData.checkedOutAt = new Date();
    }

    const assignment = await prisma.volunteerAssignment.update({
      where: { id: assignmentId },
      data: updateData,
    });

    revalidatePath("/admin/volunteers");
    return { success: true, data: assignment };
  } catch (error) {
    console.error("Failed to update check in/out:", error);
    return { success: false, error: "Failed to update check in/out" };
  }
}

export async function deleteVolunteerAssignment(assignmentId: string) {
  try {
    await prisma.volunteerAssignment.delete({
      where: { id: assignmentId },
    });

    revalidatePath("/admin/volunteers");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete assignment:", error);
    return { success: false, error: "Failed to delete assignment" };
  }
}
