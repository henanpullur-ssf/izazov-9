import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/actions/settings";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

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

// Inline blocking script to apply the theme instantly before first paint (zero FOUC)
const themeInitializerScript = `(function(){
  try {
    var stored = localStorage.getItem('izazov-theme');
    var theme = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  } catch (e) {}
})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const res = await getSiteSettings();
  const settings = res.data || DEFAULT_SITE_SETTINGS;

  // Preserve SiteSettings branding while allowing dark/light theme tokens to govern surfaces and contrast
  const customBrandStyles = {
    ...(settings.primaryColor ? { "--brand-custom": settings.primaryColor } : {}),
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={customBrandStyles}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitializerScript }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-[var(--brand)] selection:text-white bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
