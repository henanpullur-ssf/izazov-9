"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Camera,
  Tag,
  Sparkles,
} from "lucide-react";

export interface GalleryPhotoItem {
  id: string;
  title?: string | null;
  caption?: string | null;
  imageUrl: string;
  lightboxUrl?: string;
  thumbnailUrl?: string;
  width?: number | null;
  height?: number | null;
  photographer?: string | null;
  createdAt: string | Date;
  album?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  event?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

interface LightboxProps {
  photos: GalleryPhotoItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export function Lightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxProps) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPhoto = photos[currentIndex];
  const hasMultiple = photos.length > 1;

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    const nextIdx = (currentIndex - 1 + photos.length) % photos.length;
    onNavigate(nextIdx);
  }, [currentIndex, photos.length, hasMultiple, onNavigate]);

  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    const nextIdx = (currentIndex + 1) % photos.length;
    onNavigate(nextIdx);
  }, [currentIndex, photos.length, hasMultiple, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    // Lock body scrolling while lightbox is active
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Touch swipe support for mobile
  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  }

  function handleTouchMove(e: React.TouchEvent) {
    setTouchEndX(e.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  }

  if (!isOpen || !currentPhoto) return null;

  const altText =
    currentPhoto.title ||
    currentPhoto.caption ||
    `IZAZOV 9.0 Gallery Photo ${currentIndex + 1}`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Photo Lightbox"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-800/80 bg-black/60 z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-medium text-blue-300 bg-blue-950/40 border border-blue-900/50 px-2.5 py-1 rounded-full">
            {currentIndex + 1} / {photos.length}
          </span>
          {currentPhoto.album?.name && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-300 font-medium">
              <Tag className="w-3 h-3 text-blue-400" />
              {currentPhoto.album.name}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition cursor-pointer"
          aria-label="Close Lightbox (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Navigation - Prev Button */}
        {hasMultiple && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-zinc-900 text-white border border-zinc-800/80 hover:border-zinc-700 transition shadow-2xl backdrop-blur-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            aria-label="Previous Photo (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* The Photo */}
        <div className="relative max-w-full max-h-[75vh] flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPhoto.lightboxUrl || currentPhoto.imageUrl}
            alt={altText}
            className="max-h-[72vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-lg shadow-2xl transition-all duration-200"
          />
        </div>

        {/* Navigation - Next Button */}
        {hasMultiple && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-zinc-900 text-white border border-zinc-800/80 hover:border-zinc-700 transition shadow-2xl backdrop-blur-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            aria-label="Next Photo (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Metadata Bar */}
      <div className="px-4 sm:px-8 py-4 border-t border-zinc-800/80 bg-black/75 z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
              {currentPhoto.title || "IZAZOV 9.0 Official Highlight"}
            </h3>
            {currentPhoto.caption && (
              <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                {currentPhoto.caption}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-400">
            {currentPhoto.event && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#192332] border border-[#344052] text-blue-200 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                {currentPhoto.event.name}
              </span>
            )}
            {currentPhoto.photographer && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                <Camera className="w-3.5 h-3.5 text-zinc-400" />
                {currentPhoto.photographer}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-zinc-500 text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(currentPhoto.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
