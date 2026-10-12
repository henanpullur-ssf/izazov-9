import React from "react";
import { requirePermission } from "@/lib/auth-helpers";
import { AdminGalleryClient } from "@/components/admin/gallery/AdminGalleryClient";
import {
  getAlbums,
  getAdminGalleryImages,
  getGalleryStats,
} from "@/actions/gallery";
import { getEvents } from "@/actions/events";
import { getCategories } from "@/actions/categories";
import { isSuperAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const user = await requirePermission("gallery.view");

  const [imagesRes, albumsRes, eventsRes, categoriesRes, statsRes] =
    await Promise.all([
      getAdminGalleryImages({ page: 1, limit: 30 }),
      getAlbums(false), // Admin should see all albums (active + inactive)
      getEvents(),
      getCategories(false),
      getGalleryStats(),
    ]);

  const initialImages = imagesRes.data?.images || [];
  const initialPagination = imagesRes.data?.pagination || {
    total: 0,
    page: 1,
    limit: 30,
    totalPages: 0,
    hasMore: false,
  };
  const albums = albumsRes.data || [];
  const events = (eventsRes.data || []).map((e) => ({
    id: e.id,
    code: e.code,
    name: e.name,
  }));
  const categories = categoriesRes.data || [];
  const stats = statsRes.data || {
    totalImages: 0,
    publishedImages: 0,
    draftImages: 0,
    totalAlbums: 0,
    isConfigured: false,
  };

  return (
    <div className="space-y-6">
      <AdminGalleryClient
        initialImages={initialImages}
        albums={albums}
        events={events}
        categories={categories}
        stats={stats}
        pagination={initialPagination}
        userPermissions={user.permissions || []}
        isSuperAdmin={isSuperAdmin(user)}
      />
    </div>
  );
}
