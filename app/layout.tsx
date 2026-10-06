import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/actions/settings";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await getSiteSettings();
    const settings = res.data || DEFAULT_SITE_SETTINGS;

    return {
      title: settings.metaTitle || `${settings.siteName} — Campus Fest Operations & Management Platform`,
      description: settings.metaDescription || settings.tagline,
      icons: settings.faviconUrl ? [{ rel: "icon", url: settings.faviconUrl }] : undefined,
      openGraph: {
        title: settings.metaTitle,
        description: settings.metaDescription,
        images: settings.ogImageUrl ? [{ url: settings.ogImageUrl }] : undefined,
      },
    };
  } catch {
    return {
      title: "IZAZOV 9.0 — Campus Fest Operations & Management Platform",
      description: "Official operations, competitions, scoring, schedule, and results platform for IZAZOV 9.0.",
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const res = await getSiteSettings();
  const settings = res.data || DEFAULT_SITE_SETTINGS;

  const dynamicStyles = {
    "--brand": settings.primaryColor || "#931827",
    "--background": settings.backgroundColor || "#000000",
    "--surface": settings.cardColor || "#111011",
    "--surface-card": settings.cardColor || "#111011",
    "--surface-elevated": settings.surfaceColor || "#231f20",
    "--foreground": settings.textColor || "#ffffff",
    "--text-muted": settings.mutedTextColor || "#b8b8b8",
    "--border-subtle": settings.borderColor || "#2d292a",
    "--iz-primary": settings.primaryColor || "#931827",
    "--iz-background": settings.backgroundColor || "#000000",
    "--iz-surface": settings.surfaceColor || "#231f20",
    "--iz-card": settings.cardColor || "#111011",
    "--iz-text": settings.textColor || "#ffffff",
    "--iz-muted": settings.mutedTextColor || "#b8b8b8",
    "--iz-border": settings.borderColor || "#2d292a",
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={dynamicStyles}
    >
      <body
        className="min-h-full flex flex-col font-sans selection:bg-[var(--brand)] selection:text-white"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
