"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AnnouncementPriority } from "@prisma/client";

export async function getAnnouncements(onlyPublished = false) {
  try {
    const where: Record<string, unknown> = {};
    if (onlyPublished) {
      where.isPublished = true;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return { success: true, data: announcements };
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return { success: false, error: "Failed to fetch announcements" };
  }
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  priority?: AnnouncementPriority;
  isPublished?: boolean;
  isPinned?: boolean;
}) {
  try {
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title.trim(),
        content: data.content.trim(),
        priority: data.priority || AnnouncementPriority.NORMAL,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
        isPinned: data.isPinned !== undefined ? data.isPinned : false,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/announcements");
    revalidatePath("/");

    return { success: true, data: announcement };
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return { success: false, error: "Failed to create announcement" };
  }
}

export async function updateAnnouncement(
  id: string,
  data: {
    title?: string;
    content?: string;
    priority?: AnnouncementPriority;
    isPublished?: boolean;
    isPinned?: boolean;
  }
) {
  try {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.content !== undefined) updateData.content = data.content.trim();
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;
    if (data.isPublished !== undefined) {
      updateData.isPublished = data.isPublished;
      if (data.isPublished) {
        updateData.publishedAt = new Date();
      }
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/announcements");
    revalidatePath("/");

    return { success: true, data: announcement };
  } catch (error) {
    console.error("Failed to update announcement:", error);
    return { success: false, error: "Failed to update announcement" };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await prisma.announcement.delete({
      where: { id },
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/announcements");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    return { success: false, error: "Failed to delete announcement" };
  }
}

export async function togglePublishAnnouncement(id: string) {
  try {
    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Announcement not found" };
    }

    const nextPublished = !existing.isPublished;
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        isPublished: nextPublished,
        publishedAt: nextPublished ? new Date() : null,
      },
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/announcements");
    revalidatePath("/");

    return { success: true, data: announcement };
  } catch (error) {
    console.error("Failed to toggle publish:", error);
    return { success: false, error: "Failed to toggle publish" };
  }
}
