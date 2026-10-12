"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Camera,
  ArrowRight,
  Sparkles,
  Tag,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Lightbox, type GalleryPhotoItem } from "@/components/gallery/Lightbox";

interface HomeGallerySectionProps {
  initialImages: GalleryPhotoItem[];
  albums: { id: string; name: string; slug: string }[];
  title?: string | null;
  subtitle?: string | null;
  siteName?: string;
}

export function HomeGallerySection({
  initialImages = [],
  albums = [],
  title,
  subtitle,
  siteName = "IZAZOV 9.0",
}: HomeGallerySectionProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages =
    selectedAlbum === "all"
      ? initialImages
      : initialImages.filter((img) => img.album?.slug === selectedAlbum);

  const displayImages = filteredImages.slice(0, 8);

  const sectionTitle = title || "PHOTO GALLERY";
  const sectionSubtitle =
    subtitle || "Moments that define IZAZOV 9.0. Explore the highlights and triumphs.";

  return (
    <section className="py-20 sm:py-28 border-b border-[var(--border-subtle)] bg-[var(--background)] relative overflow-hidden transition-colors">
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[var(--brand-muted)] blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-semibold text-[var(--brand)] shadow-xs">
            <Camera className="w-3.5 h-3.5 text-[var(--brand)]" />
            <span>OFFICIAL FESTIVAL ARCHIVE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--foreground)] uppercase">
            {sectionTitle}
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        {/* Category / Album Filter Pills */}
        {albums.length > 0 && initialImages.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setSelectedAlbum("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedAlbum === "all"
                  ? "bg-[var(--brand)] text-[var(--brand-foreground)] shadow-md shadow-[var(--brand)]/20 border border-[var(--brand)]/40"
                  : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--foreground)] border border-[var(--border-subtle)] hover:border-[var(--brand)]"
              }`}
            >
              All Moments
            </button>
            {albums.map((album) => {
              const active = selectedAlbum === album.slug;
              return (
                <button
                  key={album.id}
                  onClick={() => setSelectedAlbum(album.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-[var(--brand)] text-[var(--brand-foreground)] shadow-md shadow-[var(--brand)]/20 border border-[var(--brand)]/40"
                      : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--foreground)] border border-[var(--border-subtle)] hover:border-[var(--brand)]"
                  }`}
                >
                  {album.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {initialImages.length === 0 ? (
          <div className="p-12 sm:p-16 text-center rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-card)] max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
              <Camera className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--foreground)]">Gallery Coming Soon</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
                Moments from {siteName} will appear here as competitions, stage showcases, and ceremonies commence.
              </p>
            </div>
          </div>
        ) : (
          /* Editorial Photo Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayImages.map((photo, idx) => {
              const altText = photo.title || `${siteName} Gallery photo ${idx + 1}`;
              return (
                <div
                  key={photo.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-card)] cursor-pointer transition-all duration-300 hover:border-[var(--brand)] hover:shadow-xl shadow-[var(--shadow-card)]"
                >
                  {/* Photo */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={altText}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                  {/* Album / Event Pill (Top Left) */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
                    {photo.album?.name && (
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white border border-white/20 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-blue-300" />
                        {photo.album.name}
                      </span>
                    )}
                  </div>

                  {/* Hover Lightbox Icon (Top Right) */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white border border-white/20">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>

                  {/* Card Bottom Meta */}
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

        {/* View Full Gallery Link Button */}
        {initialImages.length > 0 && (
          <div className="text-center pt-4">
            <Link href="/gallery">
              <Button size="lg" className="gap-2 shadow-lg shadow-[var(--brand)]/20 group">
                <span>View Full Gallery Archive</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Interactive Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={displayImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}
    </section>
  );
}
