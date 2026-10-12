"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertPermission, getCurrentUser } from "@/lib/auth-helpers";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured,
  getOptimizedImageUrl,
} from "@/lib/cloudinary";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ==========================================
// ALBUM ACTIONS
// ==========================================

export async function getAlbums(activeOnly = true) {
  try {
    const whereClause = activeOnly ? { isActive: true } : {};
    const albums = await prisma.galleryAlbum.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            images: activeOnly ? { where: { isPublished: true } } : true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return { success: true, data: albums };
  } catch (error) {
    console.error("Failed to fetch albums:", error);
    return { success: false, error: "Failed to load albums" };
  }
}

export async function createAlbum(data: {
  name: string;
  description?: string;
  coverImageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  try {
    const authCheck = await assertPermission("gallery.manage_albums");
    if (!authCheck.success) {
      // Fallback: check if user has gallery.edit or is super admin
      const user = await getCurrentUser();
      if (!user || (user.role !== "SUPER_ADMIN" && !user.permissions?.includes("gallery.manage_albums"))) {
        return { success: false, error: authCheck.error };
      }
    }

    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Album name is required" };
    }

    let baseSlug = slugify(data.name);
    if (!baseSlug) baseSlug = "album";

    // Ensure unique slug
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.galleryAlbum.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const album = await prisma.galleryAlbum.create({
      data: {
        name: data.name.trim(),
        slug: uniqueSlug,
        description: data.description?.trim() || null,
        coverImageUrl: data.coverImageUrl?.trim() || null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: true, data: album };
  } catch (error) {
    console.error("Failed to create album:", error);
    return { success: false, error: "Failed to create album" };
  }
}

export async function updateAlbum(
  id: string,
  data: {
    name?: string;
    description?: string;
    coverImageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  try {
    const authCheck = await assertPermission("gallery.manage_albums");
    if (!authCheck.success) {
      const user = await getCurrentUser();
      if (!user || (user.role !== "SUPER_ADMIN" && !user.permissions?.includes("gallery.manage_albums"))) {
        return { success: false, error: authCheck.error };
      }
    }

    const updateData: Record<string, string | number | boolean | null> = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }
    if (data.coverImageUrl !== undefined) {
      updateData.coverImageUrl = data.coverImageUrl?.trim() || null;
    }
    if (data.sortOrder !== undefined) {
      updateData.sortOrder = Number(data.sortOrder) || 0;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = Boolean(data.isActive);
    }

    const album = await prisma.galleryAlbum.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: true, data: album };
  } catch (error) {
    console.error("Failed to update album:", error);
    return { success: false, error: "Failed to update album" };
  }
}

export async function deleteAlbum(id: string) {
  try {
    const authCheck = await assertPermission("gallery.manage_albums");
    if (!authCheck.success) {
      const user = await getCurrentUser();
      if (!user || (user.role !== "SUPER_ADMIN" && !user.permissions?.includes("gallery.manage_albums"))) {
        return { success: false, error: authCheck.error };
      }
    }

    // Retrieve all images associated with this album to remove from cloud storage safely
    const images = await prisma.galleryImage.findMany({
      where: { albumId: id },
      select: { publicId: true },
    });

    // Clean up images in cloud storage
    for (const img of images) {
      if (img.publicId) {
        await deleteFromCloudinary(img.publicId);
      }
    }

    // Delete album (cascades to images in DB)
    await prisma.galleryAlbum.delete({
      where: { id },
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete album:", error);
    return { success: false, error: "Failed to delete album" };
  }
}

// ==========================================
// IMAGE ACTIONS
// ==========================================

export async function getPublicGalleryImages(params?: {
  albumSlug?: string;
  category?: string;
  eventId?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 24));
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {
      isPublished: true,
      album: {
        isActive: true,
      },
    };

    if (params?.albumSlug && params.albumSlug !== "all") {
      whereClause.album = {
        slug: params.albumSlug,
        isActive: true,
      };
    }

    if (params?.category && params.category !== "all") {
      whereClause.category = params.category;
    }

    if (params?.eventId) {
      whereClause.eventId = params.eventId;
    }

    const [total, images] = await Promise.all([
      prisma.galleryImage.count({ where: whereClause }),
      prisma.galleryImage.findMany({
        where: whereClause,
        include: {
          album: {
            select: { id: true, name: true, slug: true },
          },
          event: {
            select: { id: true, code: true, name: true },
          },
        },
        orderBy: [
          { isFeatured: "desc" },
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
    ]);

    const formattedImages = images.map((img) => ({
      ...img,
      thumbnailUrl: getOptimizedImageUrl(img.imageUrl, {
        width: 800,
        crop: "fill",
      }),
      lightboxUrl: getOptimizedImageUrl(img.imageUrl, {
        width: 1800,
        crop: "limit",
      }),
    }));

    return {
      success: true,
      data: {
        images: formattedImages,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + images.length < total,
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch public gallery images:", error);
    return {
      success: false,
      error: "Failed to load gallery photos",
      data: {
        images: [],
        pagination: { total: 0, page: 1, limit: 24, totalPages: 0, hasMore: false },
      },
    };
  }
}

export async function getAdminGalleryImages(params?: {
  albumId?: string;
  isPublished?: boolean | string;
  eventId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const authCheck = await assertPermission("gallery.view");
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 30));
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};

    if (params?.albumId && params.albumId !== "all") {
      whereClause.albumId = params.albumId;
    }

    if (params?.isPublished !== undefined && params.isPublished !== "all") {
      whereClause.isPublished = params.isPublished === true || params.isPublished === "true";
    }

    if (params?.eventId && params.eventId !== "all") {
      whereClause.eventId = params.eventId;
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim();
      whereClause.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { caption: { contains: q, mode: "insensitive" } },
        { photographer: { contains: q, mode: "insensitive" } },
        { album: { name: { contains: q, mode: "insensitive" } } },
        { event: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [total, images] = await Promise.all([
      prisma.galleryImage.count({ where: whereClause }),
      prisma.galleryImage.findMany({
        where: whereClause,
        include: {
          album: {
            select: { id: true, name: true, slug: true },
          },
          event: {
            select: { id: true, code: true, name: true },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
    ]);

    const formattedImages = images.map((img) => ({
      ...img,
      thumbnailUrl: getOptimizedImageUrl(img.imageUrl, {
        width: 400,
        crop: "fill",
      }),
      lightboxUrl: getOptimizedImageUrl(img.imageUrl, {
        width: 1600,
        crop: "limit",
      }),
    }));

    return {
      success: true,
      data: {
        images: formattedImages,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + images.length < total,
        },
      },
    };
  } catch (error) {
    console.error("Failed to fetch admin gallery images:", error);
    return { success: false, error: "Failed to load admin gallery" };
  }
}

/**
 * Handles multi-file uploads securely through server-side Cloudinary pipe.
 */
export async function uploadGalleryImages(formData: FormData) {
  try {
    const authCheck = await assertPermission("gallery.upload");
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const user = authCheck.user;

    if (!isCloudinaryConfigured()) {
      return {
        success: false,
        error:
          "Cloudinary credentials are not configured on this server. Please provide CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the environment variables.",
      };
    }

    const albumId = formData.get("albumId") as string;
    if (!albumId) {
      return { success: false, error: "Please select or create an Album first." };
    }

    const targetAlbum = await prisma.galleryAlbum.findUnique({
      where: { id: albumId },
    });
    if (!targetAlbum) {
      return { success: false, error: "Selected album was not found." };
    }

    const eventId = (formData.get("eventId") as string) || null;
    const category = (formData.get("category") as string) || null;
    const photographer = (formData.get("photographer") as string) || null;
    const isPublished = formData.get("isPublished") === "true";

    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) {
      return { success: false, error: "No image files provided for upload." };
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB max per raw photo

    const uploadedImages = [];
    const errors: string[] = [];

    for (const file of files) {
      // Validate file
      if (!file || !(file instanceof File) || file.size === 0) continue;

      if (!allowedMimeTypes.includes(file.type)) {
        errors.push(`${file.name}: Unsupported image format (${file.type}). Allowed: JPG, PNG, WebP.`);
        continue;
      }

      if (file.size > maxSizeBytes) {
        errors.push(`${file.name}: Exceeds maximum 25MB file limit.`);
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await uploadToCloudinary(
          buffer,
          file.name,
          `izazov9/gallery/${targetAlbum.slug}`
        );

        // Derive title from clean file name
        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const newImage = await prisma.galleryImage.create({
          data: {
            title: cleanTitle,
            imageUrl: uploadResult.secureUrl,
            publicId: uploadResult.publicId,
            width: uploadResult.width,
            height: uploadResult.height,
            fileSize: uploadResult.bytes,
            format: uploadResult.format,
            albumId: targetAlbum.id,
            eventId: eventId && eventId !== "none" ? eventId : null,
            category: category && category !== "none" ? category : null,
            photographer: photographer?.trim() || null,
            isPublished, // Draft by default unless admin checked publish
            uploadedById: user.id || null,
          },
        });

        // Set as album cover if album has no cover image yet
        if (!targetAlbum.coverImageUrl) {
          await prisma.galleryAlbum.update({
            where: { id: targetAlbum.id },
            data: { coverImageUrl: uploadResult.secureUrl },
          });
          targetAlbum.coverImageUrl = uploadResult.secureUrl;
        }

        uploadedImages.push(newImage);
      } catch (uploadErr) {
        console.error(`Error uploading file ${file.name}:`, uploadErr);
        errors.push(`${file.name}: ${(uploadErr as Error).message || "Upload failed"}`);
      }
    }

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    if (uploadedImages.length === 0 && errors.length > 0) {
      return {
        success: false,
        error: `Upload failed: ${errors.join("; ")}`,
      };
    }

    return {
      success: true,
      data: {
        uploadedCount: uploadedImages.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  } catch (error) {
    console.error("Failed to process uploads:", error);
    return { success: false, error: "An unexpected error occurred during image upload." };
  }
}

export async function updateGalleryImage(
  id: string,
  data: {
    title?: string;
    caption?: string;
    albumId?: string;
    eventId?: string | null;
    category?: string | null;
    photographer?: string | null;
    sortOrder?: number;
    isFeatured?: boolean;
    isPublished?: boolean;
  }
) {
  try {
    const authCheck = await assertPermission("gallery.edit");
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const updatePayload: Record<string, string | number | boolean | null> = {};

    if (data.title !== undefined) updatePayload.title = data.title?.trim() || null;
    if (data.caption !== undefined) updatePayload.caption = data.caption?.trim() || null;
    if (data.albumId !== undefined) updatePayload.albumId = data.albumId;
    if (data.eventId !== undefined) updatePayload.eventId = data.eventId && data.eventId !== "none" ? data.eventId : null;
    if (data.category !== undefined) updatePayload.category = data.category && data.category !== "none" ? data.category : null;
    if (data.photographer !== undefined) updatePayload.photographer = data.photographer?.trim() || null;
    if (data.sortOrder !== undefined) updatePayload.sortOrder = Number(data.sortOrder) || 0;
    if (data.isFeatured !== undefined) updatePayload.isFeatured = Boolean(data.isFeatured);
    if (data.isPublished !== undefined) updatePayload.isPublished = Boolean(data.isPublished);

    const updated = await prisma.galleryImage.update({
      where: { id },
      data: updatePayload,
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update image:", error);
    return { success: false, error: "Failed to update image metadata" };
  }
}

export async function togglePublishImage(id: string, isPublished: boolean) {
  try {
    const authCheck = await assertPermission("gallery.publish");
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const updated = await prisma.galleryImage.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to toggle publish status:", error);
    return { success: false, error: "Failed to change publication status" };
  }
}

export async function deleteGalleryImage(id: string) {
  try {
    const authCheck = await assertPermission("gallery.delete");
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const existing = await prisma.galleryImage.findUnique({
      where: { id },
      select: { publicId: true, albumId: true },
    });

    if (!existing) {
      return { success: false, error: "Image not found" };
    }

    // 1. Delete asset from cloud storage
    if (existing.publicId) {
      await deleteFromCloudinary(existing.publicId);
    }

    // 2. Delete database record
    await prisma.galleryImage.delete({
      where: { id },
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete image:", error);
    return { success: false, error: "Failed to delete image" };
  }
}

export async function getGalleryStats() {
  try {
    const [totalImages, publishedImages, draftImages, totalAlbums] = await Promise.all([
      prisma.galleryImage.count(),
      prisma.galleryImage.count({ where: { isPublished: true } }),
      prisma.galleryImage.count({ where: { isPublished: false } }),
      prisma.galleryAlbum.count({ where: { isActive: true } }),
    ]);

    return {
      success: true,
      data: {
        totalImages,
        publishedImages,
        draftImages,
        totalAlbums,
        isConfigured: isCloudinaryConfigured(),
      },
    };
  } catch (error) {
    console.error("Failed to get gallery stats:", error);
    return {
      success: true,
      data: {
        totalImages: 0,
        publishedImages: 0,
        draftImages: 0,
        totalAlbums: 0,
        isConfigured: isCloudinaryConfigured(),
      },
    };
  }
}
