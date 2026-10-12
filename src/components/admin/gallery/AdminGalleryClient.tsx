"use client";

import React, { useState } from "react";
import {
  Camera,
  Search,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  UploadCloud,
  FolderPlus,
  Layers,
  AlertTriangle,
  X,
  Loader2,
  Maximize2,
  Grid,
  List,
  Check,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Lightbox, type GalleryPhotoItem } from "@/components/gallery/Lightbox";
import {
  uploadGalleryImages,
  updateGalleryImage,
  togglePublishImage,
  deleteGalleryImage,
  createAlbum,
  getAdminGalleryImages,
} from "@/actions/gallery";

export interface AdminGalleryImageItem extends GalleryPhotoItem {
  isPublished: boolean;
  isFeatured: boolean;
  albumId: string;
  eventId?: string | null;
  category?: string | null;
  sortOrder?: number;
}

interface AlbumItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  coverImageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { images: number };
}

interface EventItem {
  id: string;
  code: string;
  name: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface AdminGalleryClientProps {
  initialImages: GalleryPhotoItem[];
  albums: AlbumItem[];
  events: EventItem[];
  categories: CategoryItem[];
  stats: {
    totalImages: number;
    publishedImages: number;
    draftImages: number;
    totalAlbums: number;
    isConfigured: boolean;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  userPermissions: string[];
  isSuperAdmin: boolean;
}

export function AdminGalleryClient({
  initialImages,
  albums: initialAlbums,
  events,
  categories,
  stats,
  pagination: initialPagination,
  userPermissions,
  isSuperAdmin,
}: AdminGalleryClientProps) {
  const [images, setImages] = useState<AdminGalleryImageItem[]>(initialImages as AdminGalleryImageItem[]);
  const [albums, setAlbums] = useState<AlbumItem[]>(initialAlbums);
  const [pagination, setPagination] = useState(initialPagination);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filters
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showAlbumModal, setShowAlbumModal] = useState<boolean>(false);
  const [editingImage, setEditingImage] = useState<AdminGalleryImageItem | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Upload Form state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadAlbumId, setUploadAlbumId] = useState<string>(albums[0]?.id || "");
  const [uploadEventId, setUploadEventId] = useState<string>("none");
  const [uploadCategory, setUploadCategory] = useState<string>("none");
  const [uploadPhotographer, setUploadPhotographer] = useState<string>("");
  const [uploadPublishImmediately, setUploadPublishImmediately] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ success?: string; error?: string } | null>(null);

  // Album Form state
  const [albumName, setAlbumName] = useState<string>("");
  const [albumDesc, setAlbumDesc] = useState<string>("");
  const [albumCoverUrl, setAlbumCoverUrl] = useState<string>("");
  const [albumSortOrder, setAlbumSortOrder] = useState<number>(0);
  const [isSubmittingAlbum, setIsSubmittingAlbum] = useState<boolean>(false);
  const [albumFeedback, setAlbumFeedback] = useState<string | null>(null);

  // Permissions helpers
  const canUpload = isSuperAdmin || userPermissions.includes("gallery.upload");
  const canEdit = isSuperAdmin || userPermissions.includes("gallery.edit");
  const canDelete = isSuperAdmin || userPermissions.includes("gallery.delete");
  const canPublish = isSuperAdmin || userPermissions.includes("gallery.publish");
  const canManageAlbums = isSuperAdmin || userPermissions.includes("gallery.manage_albums");

  async function refreshData(page = 1) {
    setIsLoading(true);
    const res = await getAdminGalleryImages({
      albumId: selectedAlbum,
      isPublished: selectedStatus,
      eventId: selectedEvent,
      search: searchQuery,
      page,
      limit: 30,
    });

    if (res.success && res.data) {
      setImages(res.data.images);
      setPagination(res.data.pagination);
    }
    setIsLoading(false);
  }

  async function handleFilterChange(
    albumId = selectedAlbum,
    status = selectedStatus,
    eventId = selectedEvent,
    query = searchQuery
  ) {
    setSelectedAlbum(albumId);
    setSelectedStatus(status);
    setSelectedEvent(eventId);
    setSelectedQuery(query);

    setIsLoading(true);
    const res = await getAdminGalleryImages({
      albumId,
      isPublished: status,
      eventId,
      search: query,
      page: 1,
      limit: 30,
    });

    if (res.success && res.data) {
      setImages(res.data.images);
      setPagination(res.data.pagination);
    }
    setIsLoading(false);
  }

  function setSelectedQuery(q: string) {
    setSearchQuery(q);
  }

  async function handleTogglePublish(image: AdminGalleryImageItem) {
    if (!canPublish) return;
    const newStatus = !image.isPublished;
    const res = await togglePublishImage(image.id, newStatus);
    if (res.success) {
      setImages((prev) =>
        prev.map((item) =>
          item.id === image.id ? { ...item, isPublished: newStatus } : item
        )
      );
    } else {
      alert(res.error || "Failed to update publish state");
    }
  }

  async function handleConfirmDelete() {
    if (!deletingImageId || !canDelete) return;
    const id = deletingImageId;
    const res = await deleteGalleryImage(id);
    if (res.success) {
      setImages((prev) => prev.filter((item) => item.id !== id));
      setDeletingImageId(null);
    } else {
      alert(res.error || "Failed to delete photo");
    }
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uploadFiles.length === 0) {
      setUploadFeedback({ error: "Please select at least one photo to upload." });
      return;
    }
    if (!uploadAlbumId) {
      setUploadFeedback({ error: "Please choose an album for this upload." });
      return;
    }

    setIsUploading(true);
    setUploadFeedback(null);

    const formData = new FormData();
    formData.append("albumId", uploadAlbumId);
    formData.append("eventId", uploadEventId);
    formData.append("category", uploadCategory);
    formData.append("photographer", uploadPhotographer);
    formData.append("isPublished", uploadPublishImmediately ? "true" : "false");

    for (const file of uploadFiles) {
      formData.append("files", file);
    }

    const res = await uploadGalleryImages(formData);
    setIsUploading(false);

    if (res.success) {
      setUploadFeedback({
        success: `Successfully uploaded ${res.data?.uploadedCount || uploadFiles.length} photo(s)!`,
      });
      setUploadFiles([]);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadFeedback(null);
        refreshData();
      }, 1200);
    } else {
      setUploadFeedback({ error: res.error || "Upload failed." });
    }
  }

  async function handleCreateAlbumSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!albumName.trim()) return;

    setIsSubmittingAlbum(true);
    setAlbumFeedback(null);

    const res = await createAlbum({
      name: albumName,
      description: albumDesc,
      coverImageUrl: albumCoverUrl,
      sortOrder: albumSortOrder,
    });

    setIsSubmittingAlbum(false);

    if (res.success && res.data) {
      setAlbums((prev) => [...prev, res.data as AlbumItem]);
      setAlbumName("");
      setAlbumDesc("");
      setAlbumCoverUrl("");
      setAlbumFeedback("Album created successfully!");
      if (!uploadAlbumId) {
        setUploadAlbumId(res.data.id);
      }
      setTimeout(() => {
        setShowAlbumModal(false);
        setAlbumFeedback(null);
      }, 1000);
    } else {
      setAlbumFeedback(res.error || "Failed to create album");
    }
  }

  async function handleUpdateMetadataSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingImage || !canEdit) return;

    const res = await updateGalleryImage(editingImage.id, {
      title: editingImage.title || undefined,
      caption: editingImage.caption || undefined,
      albumId: editingImage.albumId,
      eventId: editingImage.eventId,
      category: editingImage.category,
      photographer: editingImage.photographer || undefined,
      sortOrder: editingImage.sortOrder,
      isFeatured: editingImage.isFeatured,
      isPublished: editingImage.isPublished,
    });

    if (res.success) {
      setImages((prev) =>
        prev.map((item) => (item.id === editingImage.id ? { ...item, ...res.data } : item))
      );
      setEditingImage(null);
    } else {
      alert(res.error || "Failed to update image");
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">
              Gallery Management
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#931827] text-white">
              ARCHIVE
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage festival albums, bulk upload high-resolution photos, curate drafts, and publish official media.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {canManageAlbums && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAlbumModal(true)}
              className="gap-1.5"
            >
              <FolderPlus className="w-4 h-4 text-zinc-300" />
              <span>New Album</span>
            </Button>
          )}

          {canUpload && (
            <Button
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="gap-1.5 shadow-lg shadow-red-950/30"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Photos</span>
            </Button>
          )}
        </div>
      </div>

      {/* Cloudinary Storage Notice if not configured */}
      {!stats.isConfigured && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-200">
              Cloudinary Storage Configuration Notice
            </h4>
            <p className="text-xs text-amber-300/80 leading-relaxed">
              Cloudinary API credentials (<code>CLOUDINARY_CLOUD_NAME</code>, <code>CLOUDINARY_API_KEY</code>, <code>CLOUDINARY_API_SECRET</code>) are not yet configured in the environment variables. Once added, live multi-file photo uploads will immediately synchronize with the Cloudinary CDN.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-[var(--border-subtle,#262223)] bg-[var(--surface-card,#111011)] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Photos</span>
            <Camera className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {stats.totalImages}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border-subtle,#262223)] bg-[var(--surface-card,#111011)] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {stats.publishedImages}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border-subtle,#262223)] bg-[var(--surface-card,#111011)] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Drafts / Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {stats.draftImages}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border-subtle,#262223)] bg-[var(--surface-card,#111011)] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Albums</span>
            <Layers className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {albums.length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-[var(--border-subtle,#262223)] bg-[var(--surface-card,#111011)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, caption, photographer..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(selectedAlbum, selectedStatus, selectedEvent, e.target.value)}
              className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--brand,#931827)]"
            />
          </div>

          {/* Album Filter */}
          <div>
            <select
              value={selectedAlbum}
              onChange={(e) => handleFilterChange(e.target.value, selectedStatus, selectedEvent, searchQuery)}
              className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--brand,#931827)] cursor-pointer"
            >
              <option value="all">All Albums</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange(selectedAlbum, e.target.value, selectedEvent, searchQuery)}
              className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--brand,#931827)] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[var(--brand,#931827)] text-white border-red-500/40"
                  : "bg-[var(--surface,#181516)] text-zinc-400 border-[var(--border-subtle,#2e282a)] hover:text-white"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-[var(--brand,#931827)] text-white border-red-500/40"
                  : "bg-[var(--surface,#181516)] text-zinc-400 border-[var(--border-subtle,#2e282a)] hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pagination & Filter Summary */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[var(--border-subtle,#242021)] text-[11px] text-zinc-400">
          <span>
            Showing {images.length} of {pagination.total} photos
            {pagination.totalPages > 1 && ` • Page ${pagination.page} of ${pagination.totalPages}`}
          </span>
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => refreshData(pagination.page - 1)}
                className="px-2 py-1 rounded bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] disabled:opacity-40 hover:text-white transition cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={!pagination.hasMore}
                onClick={() => refreshData(pagination.page + 1)}
                className="px-2 py-1 rounded bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] disabled:opacity-40 hover:text-white transition cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
          <p className="text-xs text-zinc-500 mt-2">Loading photos...</p>
        </div>
      ) : images.length === 0 ? (
        /* Empty State */
        <div className="p-16 text-center rounded-3xl border border-dashed border-[var(--border-subtle,#2e292a)] bg-[var(--surface-card,#111011)] max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Camera className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No gallery photos yet.</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Upload your first IZAZOV 9.0 photo to get started, or refine your search filters.
            </p>
          </div>
          {canUpload && (
            <Button
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="gap-2 shadow-lg shadow-red-950/30"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Photos</span>
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((photo, idx) => (
            <div
              key={photo.id}
              className="group rounded-2xl border border-[var(--border-subtle,#262223)] bg-[var(--surface-card,#111011)] overflow-hidden flex flex-col justify-between hover:border-[var(--brand,#931827)] transition-all"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[4/3] bg-black/60 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={photo.title || "Gallery Photo"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Status Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      photo.isPublished
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/50"
                        : "bg-amber-950/80 text-amber-300 border border-amber-700/50"
                    }`}
                  >
                    {photo.isPublished ? "Published" : "Draft"}
                  </span>
                  {photo.isFeatured && (
                    <span className="p-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                  )}
                </div>

                {/* View Fullscreen button */}
                <button
                  onClick={() => setLightboxIndex(idx)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black cursor-pointer"
                  title="View full image"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Meta & Info */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white truncate">
                    {photo.title || "Untitled Photo"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400">
                    {photo.album?.name && (
                      <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {photo.album.name}
                      </span>
                    )}
                    {photo.event && (
                      <span className="px-1.5 py-0.5 rounded bg-red-950/30 border border-red-900/40 text-red-300">
                        {photo.event.code}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-2 border-t border-[var(--border-subtle,#242021)] flex items-center justify-between">
                  {canPublish && (
                    <button
                      onClick={() => handleTogglePublish(photo)}
                      className={`text-[10px] font-semibold px-2 py-1 rounded transition cursor-pointer ${
                        photo.isPublished
                          ? "text-zinc-400 hover:text-amber-400 hover:bg-amber-950/20"
                          : "text-emerald-400 hover:bg-emerald-950/20"
                      }`}
                    >
                      {photo.isPublished ? "Unpublish" : "Publish"}
                    </button>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    {canEdit && (
                      <button
                        onClick={() => setEditingImage(photo)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                        title="Edit metadata"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => setDeletingImageId(photo.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-[var(--border-subtle,#262223)] bg-[var(--surface-card,#111011)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[var(--surface,#181516)] text-zinc-400 border-b border-[var(--border-subtle,#242021)] text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Title & Caption</th>
                  <th className="px-4 py-3">Album</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle,#231f20)]">
                {images.map((photo, idx) => (
                  <tr key={photo.id} className="hover:bg-[var(--surface,#181516)] transition">
                    <td className="px-4 py-3">
                      <div
                        onClick={() => setLightboxIndex(idx)}
                        className="w-12 h-12 rounded-lg bg-zinc-900 overflow-hidden cursor-pointer shrink-0 border border-zinc-800"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.thumbnailUrl || photo.imageUrl}
                          alt={photo.title || "Photo"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-white">{photo.title || "Untitled"}</p>
                      {photo.caption && (
                        <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-xs">{photo.caption}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">
                        {photo.album?.name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {photo.event ? (
                        <span className="text-red-300 text-[11px] font-semibold">
                          {photo.event.code}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          photo.isPublished
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/50"
                            : "bg-amber-950/80 text-amber-300 border border-amber-700/50"
                        }`}
                      >
                        {photo.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-[11px]">
                      {new Date(photo.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canPublish && (
                          <button
                            onClick={() => handleTogglePublish(photo)}
                            className="px-2 py-1 rounded text-[10px] font-medium border border-zinc-800 hover:bg-zinc-800 transition cursor-pointer"
                          >
                            {photo.isPublished ? "Unpublish" : "Publish"}
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => setEditingImage(photo)}
                            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeletingImageId(photo.id)}
                            className="p-1.5 rounded hover:bg-red-950/30 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Multi-File Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl border border-[var(--border-subtle,#332c2e)] bg-[var(--surface-card,#141213)] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle,#262123)] pb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">Upload Photos to Gallery</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadFeedback?.error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs">
                {uploadFeedback.error}
              </div>
            )}
            {uploadFeedback?.success && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{uploadFeedback.success}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Target Album Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Target Album <span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadAlbumId}
                  onChange={(e) => setUploadAlbumId(e.target.value)}
                  required
                  className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--brand,#931827)] cursor-pointer"
                >
                  <option value="">Select Album...</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {albums.length === 0 && (
                  <p className="text-[11px] text-amber-400 mt-1">
                    No albums exist yet. Please create an album first.
                  </p>
                )}
              </div>

              {/* Associated Event & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Link to Event (Optional)
                  </label>
                  <select
                    value={uploadEventId}
                    onChange={(e) => setUploadEventId(e.target.value)}
                    className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--brand,#931827)] cursor-pointer"
                  >
                    <option value="none">None (General Fest)</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.code} — {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Category (Optional)
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--brand,#931827)] cursor-pointer"
                  >
                    <option value="none">None</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photographer attribution */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Photographer Credit (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Media Cell / John Doe"
                  value={uploadPhotographer}
                  onChange={(e) => setUploadPhotographer(e.target.value)}
                  className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--brand,#931827)]"
                />
              </div>

              {/* Multi-File Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Select Photos (JPG, PNG, WebP — up to 25MB each)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => {
                    if (e.target.files) {
                      setUploadFiles(Array.from(e.target.files));
                    }
                  }}
                  className="w-full bg-[var(--surface,#181516)] border border-dashed border-[var(--border-subtle,#383133)] rounded-2xl p-4 text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--brand,#931827)] file:text-white hover:file:bg-red-700 cursor-pointer"
                />
                {uploadFiles.length > 0 && (
                  <p className="text-[11px] text-zinc-400 mt-2">
                    {uploadFiles.length} file(s) selected (Total:{" "}
                    {(
                      uploadFiles.reduce((acc, f) => acc + f.size, 0) /
                      (1024 * 1024)
                    ).toFixed(1)}{" "}
                    MB)
                  </p>
                )}
              </div>

              {/* Publish immediately toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="publishImmediately"
                  checked={uploadPublishImmediately}
                  onChange={(e) => setUploadPublishImmediately(e.target.checked)}
                  className="rounded border-zinc-700 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label
                  htmlFor="publishImmediately"
                  className="text-xs text-zinc-300 cursor-pointer"
                >
                  Publish immediately (otherwise saved as <span className="text-amber-400 font-semibold">Draft</span> for review)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle,#262123)]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUploading || uploadFiles.length === 0}
                  className="gap-2 shadow-lg shadow-red-950/30"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Uploading to Cloud CDN...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Start Upload ({uploadFiles.length})</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Album Modal */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border-subtle,#332c2e)] bg-[var(--surface-card,#141213)] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle,#262123)] pb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">Create New Album</h3>
              </div>
              <button
                onClick={() => setShowAlbumModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {albumFeedback && (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white">
                {albumFeedback}
              </div>
            )}

            <form onSubmit={handleCreateAlbumSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Album Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inauguration & Day 1"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  required
                  className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--brand,#931827)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Official festival moments from opening ceremonies..."
                  rows={2}
                  value={albumDesc}
                  onChange={(e) => setAlbumDesc(e.target.value)}
                  className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--brand,#931827)] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={albumSortOrder}
                  onChange={(e) => setAlbumSortOrder(Number(e.target.value))}
                  className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--brand,#931827)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle,#262123)]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAlbumModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingAlbum || !albumName.trim()}
                >
                  {isSubmittingAlbum ? "Creating..." : "Create Album"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Image Metadata Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-[var(--border-subtle,#332c2e)] bg-[var(--surface-card,#141213)] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle,#262123)] pb-4">
              <h3 className="text-base font-bold text-white">Edit Photo Metadata</h3>
              <button
                onClick={() => setEditingImage(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMetadataSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={editingImage.title || ""}
                  onChange={(e) =>
                    setEditingImage({ ...editingImage, title: e.target.value })
                  }
                  className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--brand,#931827)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Caption / Description
                </label>
                <textarea
                  rows={2}
                  value={editingImage.caption || ""}
                  onChange={(e) =>
                    setEditingImage({ ...editingImage, caption: e.target.value })
                  }
                  className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--brand,#931827)] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Album
                  </label>
                  <select
                    value={editingImage.albumId}
                    onChange={(e) =>
                      setEditingImage({ ...editingImage, albumId: e.target.value })
                    }
                    className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--brand,#931827)]"
                  >
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Event
                  </label>
                  <select
                    value={editingImage.eventId || "none"}
                    onChange={(e) =>
                      setEditingImage({ ...editingImage, eventId: e.target.value })
                    }
                    className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--brand,#931827)]"
                  >
                    <option value="none">None</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.code} — {e.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Photographer
                  </label>
                  <input
                    type="text"
                    value={editingImage.photographer || ""}
                    onChange={(e) =>
                      setEditingImage({ ...editingImage, photographer: e.target.value })
                    }
                    className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--brand,#931827)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingImage.sortOrder ?? 0}
                    onChange={(e) =>
                      setEditingImage({ ...editingImage, sortOrder: Number(e.target.value) })
                    }
                    className="w-full bg-[var(--surface,#181516)] border border-[var(--border-subtle,#2e282a)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--brand,#931827)]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingImage.isFeatured}
                    onChange={(e) =>
                      setEditingImage({ ...editingImage, isFeatured: e.target.checked })
                    }
                    className="rounded border-zinc-700 text-red-600 focus:ring-red-500"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingImage.isPublished}
                    onChange={(e) =>
                      setEditingImage({ ...editingImage, isPublished: e.target.checked })
                    }
                    className="rounded border-zinc-700 text-red-600 focus:ring-red-500"
                  />
                  <span>Published Publicly</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle,#262123)]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingImage(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingImageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--border-subtle,#332c2e)] bg-[var(--surface-card,#141213)] p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-center justify-center text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Delete this photo?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This action will permanently remove the photo from the gallery archive and cloud storage CDN.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingImageId(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleConfirmDelete}
              >
                Delete Photo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={images}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}
    </div>
  );
}
