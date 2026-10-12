-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "gallerySubtitle" TEXT DEFAULT 'Relive the highlights, emotion, and triumph of IZAZOV 9.0.',
ADD COLUMN     "galleryTitle" TEXT DEFAULT 'MOMENTS & MEMORIES',
ADD COLUMN     "showGallery" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showGalleryNav" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "GalleryAlbum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "slug" TEXT,
    "caption" TEXT,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "format" TEXT,
    "albumId" TEXT NOT NULL,
    "eventId" TEXT,
    "category" TEXT,
    "photographer" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GalleryAlbum_slug_key" ON "GalleryAlbum"("slug");

-- CreateIndex
CREATE INDEX "GalleryAlbum_isActive_idx" ON "GalleryAlbum"("isActive");

-- CreateIndex
CREATE INDEX "GalleryAlbum_sortOrder_idx" ON "GalleryAlbum"("sortOrder");

-- CreateIndex
CREATE INDEX "GalleryAlbum_slug_idx" ON "GalleryAlbum"("slug");

-- CreateIndex
CREATE INDEX "GalleryImage_albumId_idx" ON "GalleryImage"("albumId");

-- CreateIndex
CREATE INDEX "GalleryImage_eventId_idx" ON "GalleryImage"("eventId");

-- CreateIndex
CREATE INDEX "GalleryImage_isPublished_idx" ON "GalleryImage"("isPublished");

-- CreateIndex
CREATE INDEX "GalleryImage_isFeatured_idx" ON "GalleryImage"("isFeatured");

-- CreateIndex
CREATE INDEX "GalleryImage_sortOrder_idx" ON "GalleryImage"("sortOrder");

-- CreateIndex
CREATE INDEX "GalleryImage_createdAt_idx" ON "GalleryImage"("createdAt");

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
