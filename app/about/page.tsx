import React from "react";
import Link from "next/link";
import {
  Shield,
  Flame,
  CheckCircle2,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import { getHouses, getSiteSettings } from "@/actions/settings";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const res = await getSiteSettings();
  const settings = res.data || DEFAULT_SITE_SETTINGS;
  return {
    title: `About & House Championship | ${settings.siteName || "IZAZOV 9.0"}`,
    description: settings.aboutDescription || "Learn about the festival championship, house system, rules, and governance.",
  };
}

export default async function PublicAboutPage() {
  const [settingsRes, housesRes] = await Promise.all([
    getSiteSettings(),
    getHouses(),
  ]);

  const settings = settingsRes.data || DEFAULT_SITE_SETTINGS;
  const houses = housesRes.data || [];

  return (
    <div className="min-h-screen bg-[var(--background,#000000)] text-[var(--foreground,#FFFFFF)] flex flex-col selection:bg-[var(--brand,#931827)]">
      <PublicNavbar settings={settings} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        {/* Title Header */}
        <div className="space-y-4 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand,#931827)]">
            THE {settings.edition || "9.0"} EDITION
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            {settings.aboutTitle || `About ${settings.siteName || "IZAZOV 9.0"}`}
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed">
            {settings.aboutDescription ||
              "IZAZOV (meaning “The Challenge”) is our premier annual campus festival uniting students across technical hackathons, cultural showdowns, debates, arts, and esports arenas."}
          </p>
        </div>

        {/* Optional About Banner Image */}
        {settings.aboutImageUrl && (
          <div className="rounded-3xl overflow-hidden border border-[var(--border-subtle,#2d292a)] max-h-96 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.aboutImageUrl}
              alt={settings.aboutTitle}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Four Houses Championship Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle,#242122)]">
            <Flame className="w-5 h-5 text-[var(--brand,#931827)]" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              The Four Houses Championship
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Every enrolled participant is inducted into one of our legendary campus houses. Points earned in individual and group competitions accumulate directly to the annual House Trophy leaderboard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(houses.length > 0
              ? houses
              : [
                  {
                    id: "1",
                    name: "Phoenix",
                    shortName: "PHX",
                    description:
                      "House of Flames & Innovation. Known for technical dominance and bold choreography.",
                  },
                  {
                    id: "2",
                    name: "Pegasus",
                    shortName: "PEG",
                    description:
                      "House of Vision & Culture. Renowned for theatrical productions, music, and literary arts.",
                  },
                  {
                    id: "3",
                    name: "Orion",
                    shortName: "ORN",
                    description:
                      "House of Strategy & Intellect. Excelling in debate, quiz, strategy games, and coding sprints.",
                  },
                  {
                    id: "4",
                    name: "Hydra",
                    shortName: "HYD",
                    description:
                      "House of Resilience & Power. Dominating esports, physical sports, and battle of the bands.",
                  },
                ]
            ).map((h) => (
              <Card
                key={h.id}
                className="p-5 space-y-2 border-[var(--border-subtle,#2c2829)] bg-[var(--surface,#141314)]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-lg">{h.name}</h3>
                  {h.shortName && (
                    <Badge variant="primary">{h.shortName}</Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {h.description || "Official competitive house."}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Code of Conduct & Guidelines */}
        <section id="guidelines" className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle,#242122)]">
            <Shield className="w-5 h-5 text-[var(--brand,#931827)]" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Code of Conduct & Competition Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Card className="p-5 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                1. Pass & Gate Verification
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                All registered participants and spectators must present their digital QR pass or physical college ID at the security gates. Gate passes are non-transferable.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                2. Reporting Timelines
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                Teams and solo participants must report to the assigned venue stage at least 15 minutes prior to the scheduled start time. Late arrivals may forfeit their round.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                3. Jury Decision Finality
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                Decisions of the official judging panel are final and binding. Scores are verified by the super admin operations desk before publication on the live portal.
              </p>
            </Card>

            <Card className="p-5 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                4. Sportsmanship & Integrity
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                Unsportsmanlike conduct, plagiarism in technical events, or unauthorized equipment tampering results in immediate disqualification and forfeiture of house points.
              </p>
            </Card>
          </div>
        </section>

        {/* Fest Logistics & Contact Desk */}
        <section className="p-8 rounded-3xl border border-[var(--border-subtle,#2d292a)] bg-[var(--surface-card,#121112)] text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Operations & Helpdesk
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Our central operations committee is active throughout the festival days to assist participants and audience members.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-300 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-[var(--surface,#181617)] border border-[var(--border-subtle,#282526)] space-y-1">
              <Calendar className="w-4 h-4 text-[var(--brand,#931827)] mx-auto mb-1" />
              <p className="font-semibold text-white">Festival Dates</p>
              <p className="text-zinc-400">
                {settings.startDate && settings.endDate
                  ? `${settings.startDate} - ${settings.endDate}`
                  : "March 2026"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface,#181617)] border border-[var(--border-subtle,#282526)] space-y-1">
              <MapPin className="w-4 h-4 text-[var(--brand,#931827)] mx-auto mb-1" />
              <p className="font-semibold text-white">Main Venue</p>
              <p className="text-zinc-400 truncate">
                {settings.venueName || "Main Campus Arena"}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">
                {settings.venueLocation || "Campus Grounds"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface,#181617)] border border-[var(--border-subtle,#282526)] space-y-1">
              <Mail className="w-4 h-4 text-[var(--brand,#931827)] mx-auto mb-1" />
              <p className="font-semibold text-white">Contact & Support</p>
              <p className="text-zinc-400 truncate">
                {settings.contactEmail || "fest@izazov9.com"}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">
                {settings.contactPhone || "+91 98765 43210"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/events">
              <Button size="sm">Explore Events</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Staff & Admin Portal
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
