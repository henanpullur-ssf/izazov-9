"use client";

import React, { useState } from "react";
import {
  Camera,
  Sparkles,
  Tag,
  Maximize2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Lightbox, type GalleryPhotoItem } from "@/components/gallery/Lightbox";
import { getPublicGalleryImages } from "@/actions/gallery";

interface PublicGalleryClientProps {
  initialImages: GalleryPhotoItem[];
  albums: { id: string; name: string; slug: string; _count?: { images: number } }[];
  categories: { id: string; name: string }[];
  events: { id: string; code: string; name: string }[];
  initialPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
  festName?: string;
}

export function PublicGalleryClient({
  initialImages,
  albums,
  categories,
  events,
  initialPagination,
  festName = "IZAZOV 9.0",
}: PublicGalleryClientProps) {
  const [images, setImages] = useState<GalleryPhotoItem[]>(initialImages);
  const [pagination, setPagination] = useState(initialPagination);
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  async function applyFilters(albumSlug: string, cat: string, evtId: string) {
    setIsFiltering(true);
    setSelectedAlbum(albumSlug);
    setSelectedCategory(cat);
    setSelectedEvent(evtId);

    const res = await getPublicGalleryImages({
      albumSlug,
      category: cat,
      eventId: evtId !== "all" ? evtId : undefined,
      page: 1,
      limit: 24,
    });

    if (res.success && res.data) {
      setImages(res.data.images as GalleryPhotoItem[]);
      setPagination(res.data.pagination);
    }
    setIsFiltering(false);
  }

  async function handleLoadMore() {
    if (isLoadingMore || !pagination.hasMore) return;
    setIsLoadingMore(true);

    const nextPage = pagination.page + 1;
    const res = await getPublicGalleryImages({
      albumSlug: selectedAlbum,
      category: selectedCategory,
      eventId: selectedEvent !== "all" ? selectedEvent : undefined,
      page: nextPage,
      limit: 24,
    });

    if (res.success && res.data) {
      setImages((prev) => [...prev, ...(res.data.images as GalleryPhotoItem[])]);
      setPagination(res.data.pagination);
    }
    setIsLoadingMore(false);
  }

  function handleResetFilters() {
    applyFilters("all", "all", "all");
  }

  return (
    <div className="space-y-10">
      {/* Dynamic Filter Controls */}
      <div className="p-4 sm:p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-card)] space-y-4">
        {/* Album Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => applyFilters("all", selectedCategory, selectedEvent)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedAlbum === "all"
                ? "bg-[var(--brand)] text-[var(--brand-foreground)] shadow-md shadow-[var(--brand)]/20 border border-[var(--brand)]/40"
                : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--foreground)] border border-[var(--border-subtle)] hover:border-[var(--brand)]"
            }`}
          >
            All Albums
          </button>
          {albums.map((album) => {
            const active = selectedAlbum === album.slug;
            return (
              <button
                key={album.id}
                onClick={() => applyFilters(album.slug, selectedCategory, selectedEvent)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "bg-[var(--brand)] text-[var(--brand-foreground)] shadow-md shadow-[var(--brand)]/20 border border-[var(--brand)]/40"
                    : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--foreground)] border border-[var(--border-subtle)] hover:border-[var(--brand)]"
                }`}
              >
                <span>{album.name}</span>
                {typeof album._count?.images === "number" && (
                  <span className="ml-1.5 opacity-60 text-[10px]">
                    ({album._count.images})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters (Category & Event dropdowns) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Select */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--text-dim)] font-medium">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    applyFilters(selectedAlbum, e.target.value, selectedEvent)
                  }
                  className="bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border-strong)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--brand)] cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Event Select */}
            {events.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--text-dim)] font-medium">Event:</span>
                <select
                  value={selectedEvent}
                  onChange={(e) =>
                    applyFilters(selectedAlbum, selectedCategory, e.target.value)
                  }
                  className="bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border-strong)] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[var(--brand)] cursor-pointer max-w-[200px]"
                >
                  <option value="all">All Competitions</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.code} — {e.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[var(--text-dim)] font-mono text-[11px]">
              Showing {images.length} of {pagination.total} photos
            </span>
            {(selectedAlbum !== "all" ||
              selectedCategory !== "all" ||
              selectedEvent !== "all") && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-[var(--brand)] hover:underline cursor-pointer font-medium"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading state during filter update */}
      {isFiltering ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)] mx-auto" />
          <p className="text-xs text-[var(--text-muted)] mt-2">Loading gallery archive...</p>
        </div>
      ) : images.length === 0 ? (
        /* Empty State */
        <div className="p-16 text-center rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-card)] max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
            <Camera className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--foreground)]">No Photos Found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
              No photos currently match your selected filters. Try switching albums or clearing filters.
            </p>
          </div>
          {(selectedAlbum !== "all" ||
            selectedCategory !== "all" ||
            selectedEvent !== "all") && (
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        /* Full Photo Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {images.map((photo, idx) => {
            const altText = photo.title || `${festName} Gallery Photo ${idx + 1}`;
            return (
              <div
                key={photo.id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-card)] cursor-pointer transition-all duration-300 hover:border-[var(--brand)] hover:shadow-xl shadow-[var(--shadow-card)]"
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={altText}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-75 group-hover:opacity-95 transition-opacity" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
                  {photo.album?.name && (
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white border border-white/20 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5 text-blue-300" />
                      {photo.album.name}
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white border border-white/20">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>

                {/* Bottom Meta */}
                <div className="absolute bottom-3 left-3 right-3 space-y-1">
                  {photo.event && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {photo.event.name}
                    </span>
                  )}
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-blue-100 transition-colors">
                    {photo.title || "IZAZOV Moment"}
                  </h3>
                  {photo.photographer && (
                    <p className="text-[10px] text-zinc-300 flex items-center gap-1">
                      <Camera className="w-2.5 h-2.5 text-zinc-400" />
                      Photo: {photo.photographer}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {pagination.hasMore && (
        <div className="text-center pt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="gap-2 min-w-[200px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[var(--brand)]" />
                <span>Loading more moments...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Load More Photos</span>
              </>
            )}
          </Button>
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
