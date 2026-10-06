import React from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Shield,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import type { SiteSettingsData } from "@/lib/constants";
import { FEST_NAME, FEST_DATES, FEST_TAGLINE } from "@/lib/constants";

interface PublicFooterProps {
  settings?: SiteSettingsData | null;
}

export function PublicFooter({ settings }: PublicFooterProps) {
  const siteName = settings?.siteName || FEST_NAME;
  const tagline = settings?.tagline || FEST_TAGLINE;
  const festDates =
    settings?.startDate && settings?.endDate
      ? `${settings.startDate} - ${settings.endDate}`
      : FEST_DATES;
  const footerText =
    settings?.footerText ||
    `${tagline}. The premier campus cultural, technical, and esports festival.`;
  const copyrightText =
    settings?.copyrightText || `© 2026 ${siteName}. All rights reserved.`;

  const showEvents = settings ? settings.showEvents : true;
  const showSchedule = settings ? settings.showScheduleNav : true;
  const showVenues = settings ? settings.showVenuesNav : true;
  const showResults = settings ? settings.showResultsNav : true;
  const showAnnouncements = settings ? settings.showAnnouncementsNav : true;
  const showAbout = settings ? settings.showAboutNav : true;

  const hasSocials =
    Boolean(settings?.instagramUrl) ||
    Boolean(settings?.facebookUrl) ||
    Boolean(settings?.youtubeUrl) ||
    Boolean(settings?.whatsappUrl) ||
    Boolean(settings?.websiteUrl);

  return (
    <footer className="border-t border-[var(--border-subtle,#232021)] bg-[var(--surface-card,#0c0b0c)] text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              {settings?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt={siteName}
                  className="h-7 w-auto max-w-[100px] object-contain rounded-md"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-[var(--brand,#931827)] flex items-center justify-center font-black text-white text-xs">
                  {settings?.shortName
                    ? settings.shortName.slice(0, 2).toUpperCase()
                    : siteName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-base font-bold text-white tracking-wide">
                {siteName}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{footerText}</p>
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[var(--brand,#931827)]" />
              <span>{festDates}</span>
            </div>

            {/* Social Media Links */}
            {hasSocials && (
              <div className="flex items-center gap-2.5 pt-2">
                {settings?.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-[var(--border-subtle,#2a2728)] text-zinc-400 hover:text-white hover:border-[var(--brand,#931827)] transition"
                    aria-label="Instagram"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </a>
                )}
                {settings?.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-[var(--border-subtle,#2a2728)] text-zinc-400 hover:text-white hover:border-[var(--brand,#931827)] transition"
                    aria-label="Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                )}
                {settings?.youtubeUrl && (
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-[var(--border-subtle,#2a2728)] text-zinc-400 hover:text-white hover:border-[var(--brand,#931827)] transition"
                    aria-label="YouTube"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                      <polygon points="10 15 15 12 10 9 10 15"/>
                    </svg>
                  </a>
                )}
                {settings?.whatsappUrl && (
                  <a
                    href={settings.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-[var(--border-subtle,#2a2728)] text-zinc-400 hover:text-white hover:border-[var(--brand,#931827)] transition"
                    aria-label="WhatsApp"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                    </svg>
                  </a>
                )}
                {settings?.websiteUrl && (
                  <a
                    href={settings.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-[var(--border-subtle,#2a2728)] text-zinc-400 hover:text-white hover:border-[var(--brand,#931827)] transition"
                    aria-label="Official Website"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Explore
            </p>
            <ul className="space-y-2">
              {showEvents && (
                <li>
                  <Link href="/events" className="hover:text-white transition">
                    Competitions & Events
                  </Link>
                </li>
              )}
              {showSchedule && (
                <li>
                  <Link href="/schedule" className="hover:text-white transition">
                    Festival Schedule
                  </Link>
                </li>
              )}
              {showVenues && (
                <li>
                  <Link href="/venues" className="hover:text-white transition">
                    Campus Stages & Venues
                  </Link>
                </li>
              )}
              {showResults && (
                <li>
                  <Link href="/results" className="hover:text-white transition">
                    Live Leaderboard & Results
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Information & Rules */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Information
            </p>
            <ul className="space-y-2">
              {showAnnouncements && (
                <li>
                  <Link
                    href="/announcements"
                    className="hover:text-white transition"
                  >
                    Official Bulletins
                  </Link>
                </li>
              )}
              {showAbout && (
                <li>
                  <Link href="/about" className="hover:text-white transition">
                    House Championship System
                  </Link>
                </li>
              )}
              {showAbout && (
                <li>
                  <Link
                    href="/about#guidelines"
                    className="hover:text-white transition"
                  >
                    Code of Conduct
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition text-[var(--brand,#931827)]"
                >
                  Coordinator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Location & Contact */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Campus Center
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {settings?.contactAddress ||
                "Main Campus Arena, Grand Auditorium & Tech Hub."}
            </p>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                <MapPin className="w-3.5 h-3.5 text-[var(--brand,#931827)] flex-shrink-0" />
                <span className="truncate">
                  {settings?.venueLocation || "Central Campus Grounds"}
                </span>
              </div>
              {settings?.contactEmail && (
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <Mail className="w-3.5 h-3.5 text-[var(--brand,#931827)] flex-shrink-0" />
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="hover:text-white truncate"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              )}
              {settings?.contactPhone && (
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <Phone className="w-3.5 h-3.5 text-[var(--brand,#931827)] flex-shrink-0" />
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="hover:text-white truncate"
                  >
                    {settings.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-subtle,#1f1c1d)] flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400 text-[11px]">
          <p>{copyrightText}</p>
          <div className="flex items-center gap-4">
            {showAbout && (
              <Link href="/about#guidelines" className="hover:text-white">
                Rules
              </Link>
            )}
            {showAbout && (
              <Link href="/about" className="hover:text-white">
                House Standings
              </Link>
            )}
            <Link
              href="/login"
              className="hover:text-white flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-[var(--brand,#931827)]" /> Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
