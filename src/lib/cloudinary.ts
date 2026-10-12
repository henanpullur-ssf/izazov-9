import { v2 as cloudinary } from "cloudinary";

/**
 * Server-side Cloudinary configuration & helpers for IZAZOV 9.0 Gallery.
 * All credentials are strictly read from environment variables.
 */

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Returns true if all required Cloudinary environment variables are set.
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

/**
 * Uploads an image buffer securely to Cloudinary inside the designated folder.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  folder = "izazov9/gallery"
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_"),
        overwrite: false,
        transformation: [
          { quality: "auto:good", fetch_format: "auto" }
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed with empty result"));
          return;
        }

        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          format: result.format,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes an image from Cloudinary using its public_id.
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!isCloudinaryConfigured() || !publicId) {
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    return result.result === "ok";
  } catch (err) {
    console.error(`Failed to delete asset ${publicId} from Cloudinary:`, err);
    return false;
  }
}

/**
 * Constructs an optimized Cloudinary delivery URL with dynamic width, quality, and modern format.
 */
export function getOptimizedImageUrl(
  rawUrl: string,
  options?: {
    width?: number;
    height?: number;
    crop?: "fill" | "limit" | "fit" | "thumb";
    quality?: "auto" | "good" | "best" | number;
  }
): string {
  if (!rawUrl) return "";

  // If not a cloudinary delivery URL, return as-is
  if (!rawUrl.includes("res.cloudinary.com") || !rawUrl.includes("/image/upload/")) {
    return rawUrl;
  }

  const parts = rawUrl.split("/image/upload/");
  if (parts.length !== 2) return rawUrl;

  const prefix = parts[0] + "/image/upload/";
  const suffix = parts[1];

  const transforms: string[] = ["f_auto", "q_auto"];

  if (options?.width) {
    transforms.push(`w_${options.width}`);
  }
  if (options?.height) {
    transforms.push(`h_${options.height}`);
  }
  if (options?.crop) {
    transforms.push(`c_${options.crop}`);
    if (options.crop === "fill" || options.crop === "thumb") {
      transforms.push("g_auto");
    }
  }

  // If suffix already has transformations, avoid duplicating or just prepend
  if (suffix.startsWith("f_auto") || suffix.startsWith("w_") || suffix.startsWith("c_")) {
    return rawUrl;
  }

  return `${prefix}${transforms.join(",")}/${suffix}`;
}
