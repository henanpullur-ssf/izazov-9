import React from "react";
import type { Metadata } from "next";
import { Camera } from "lucide-react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicGalleryClient } from "@/components/gallery/PublicGalleryClient";
import { getSiteSettings } from "@/actions/settings";
import { getAlbums, getPublicGalleryImages } from "@/actions/gallery";
import { getCategories } from "@/actions/categories";
import { getEvents } from "@/actions/events";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settingsRes = await getSiteSettings();
  const settings = settingsRes.data || DEFAULT_SITE_SETTINGS;
  const siteName = settings.siteName || "IZAZOV 9.0";

  return {
    title: `Photo Gallery Archive — ${siteName}`,
    description: `Relive the moments, celebrations, competitions, and emotion of ${siteName} through our official photo archive.`,
  };
}

export default async function GalleryPage() {
  const [settingsRes, albumsRes, categoriesRes, eventsRes, imagesRes] =
    await Promise.all([
      getSiteSettings(),
      getAlbums(true),
      getCategories(false),
      getEvents(),
      getPublicGalleryImages({ page: 1, limit: 24 }),
    ]);

  const settings = settingsRes.data || DEFAULT_SITE_SETTINGS;
  const albums = albumsRes.data || [];
  const categories = categoriesRes.data || [];
  const events = (eventsRes.data || []).map((e) => ({
    id: e.id,
    code: e.code,
    name: e.name,
  }));
  const initialImages = imagesRes.data?.images || [];
  const initialPagination = imagesRes.data?.pagination || {
    total: 0,
    page: 1,
    limit: 24,
    totalPages: 0,
    hasMore: false,
  };

  const siteName = settings.siteName || "IZAZOV 9.0";
  const galleryTitle = settings.galleryTitle || "PHOTO GALLERY";
  const gallerySubtitle =
    settings.gallerySubtitle ||
    "Moments that define IZAZOV 9.0. Relive the highlights, emotion, and triumph.";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col selection:bg-[var(--brand)] selection:text-white transition-colors">
      <PublicNavbar settings={settings} />

      <main className="flex-1">
        {/* Gallery Hero Section */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)] py-16 sm:py-24 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--brand-muted),transparent)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-semibold text-[var(--brand)] shadow-xs">
              <Camera className="w-3.5 h-3.5 text-[var(--brand)]" />
              <span>OFFICIAL FESTIVAL ARCHIVE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--foreground)] uppercase max-w-4xl mx-auto leading-tight">
              {galleryTitle}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
              {gallerySubtitle}
            </p>
          </div>
        </section>

        {/* Gallery Content Stage */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PublicGalleryClient
              initialImages={initialImages}
              albums={albums}
              categories={categories}
              events={events}
              initialPagination={initialPagination}
              festName={siteName}
            />
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
