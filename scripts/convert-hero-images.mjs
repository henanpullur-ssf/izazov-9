/**
 * Convert large PNG hero collages to web-optimised WebP.
 * Run once: node scripts/convert-hero-images.mjs
 * Originals are left untouched in public/.
 */
import sharp from "sharp";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const jobs = [
  { src: "hero-bg-1.png", out: "hero-bg-1.webp", quality: 82, maxW: 2400 },
  { src: "hero-bg-2.png", out: "hero-bg-2.webp", quality: 80, maxW: 2400 },
];

for (const { src, out, quality, maxW } of jobs) {
  const srcPath = path.join(publicDir, src);
  const outPath = path.join(publicDir, out);

  if (!fs.existsSync(srcPath)) {
    console.error(`MISSING: ${srcPath}`);
    process.exit(1);
  }

  const meta = await sharp(srcPath).metadata();
  console.log(`\n${src}: ${meta.width}×${meta.height} ${meta.format}`);

  const resizeW = meta.width > maxW ? maxW : undefined;

  await sharp(srcPath)
    .resize(resizeW)          // downsample only if wider than maxW
    .webp({ quality, effort: 5 })
    .toFile(outPath);

  const inBytes  = fs.statSync(srcPath).size;
  const outBytes = fs.statSync(outPath).size;
  const pct = ((1 - outBytes / inBytes) * 100).toFixed(1);
  console.log(
    `  → ${out}: ${(outBytes / 1024 / 1024).toFixed(2)} MB  (saved ${pct}% of ${(inBytes / 1024 / 1024).toFixed(1)} MB)`
  );
}

console.log("\nDone.");
