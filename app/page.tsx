import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Trophy,
  Megaphone,
  MapPin,
  ArrowRight,
  Users,
  ChevronRight,
} from "lucide-react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { getEvents } from "@/actions/events";
import { getSchedules } from "@/actions/schedule";
import { getAnnouncements } from "@/actions/announcements";
import { getResults } from "@/actions/results";
import { getVenues } from "@/actions/venues";
import { getCategories } from "@/actions/categories";
import { getHouses, getSiteSettings } from "@/actions/settings";
import { getAlbums, getPublicGalleryImages } from "@/actions/gallery";
import { HomeGallerySection } from "@/components/gallery/HomeGallerySection";
import {
  DEFAULT_SITE_SETTINGS,
  formatDate,
  formatTime,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    settingsRes,
    eventsRes,
    categoriesRes,
    schedulesRes,
    announcementsRes,
    resultsRes,
    venuesRes,
    housesRes,
    albumsRes,
    galleryImagesRes,
  ] = await Promise.all([
    getSiteSettings(),
    getEvents(),
    getCategories(false),
    getSchedules(),
    getAnnouncements(true),
    getResults(),
    getVenues(),
    getHouses(),
    getAlbums(true),
    getPublicGalleryImages({ page: 1, limit: 12 }),
  ]);

  const settings = settingsRes.data || DEFAULT_SITE_SETTINGS;
  const events = eventsRes.data || [];
  const categories = categoriesRes.data || [];
  const schedules = (schedulesRes.data || []).slice(0, 4);
  const announcements = (announcementsRes.data || []).slice(0, 3);
  const results = (resultsRes.data || []).slice(0, 4);
  const venues = (venuesRes.data || []).slice(0, 3);
  const houses = housesRes.data || [];
  const galleryAlbums = albumsRes.data || [];
  const galleryImages = galleryImagesRes.data?.images || [];

  const festDates =
    settings.startDate && settings.endDate
      ? `${settings.startDate} - ${settings.endDate}`
      : "NOV 2026";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col selection:bg-[var(--brand)] selection:text-white transition-colors">
      <PublicNavbar settings={settings} />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden border-b border-[var(--border-subtle)] py-20 sm:py-32 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--brand-muted),transparent)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-semibold text-[var(--brand)] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[var(--brand)] animate-ping" />
              <span>
                THE {settings.edition || "9.0"} EDITION • {festDates}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase max-w-4xl mx-auto leading-[1.05]">
              {settings.heroTitle ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] via-[#8D4B26] to-[var(--brand)]">
                  {settings.heroTitle}
                </span>
              ) : (
                <>
                  FROM ROOTS TO{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] via-[#8D4B26] to-[var(--brand)]">
                    HORIZON
                  </span>
                </>
              )}
              <br />
              <span className="text-[var(--foreground)]">{settings.siteName || "IZAZOV 9.0"}</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
              {settings.heroDescription ||
                "The flagship campus festival uniting cultural spectacles, 24-hour hackathons, esports battles, literary arenas, and the championship cup."}
            </p>

            {/* Quick Action Navigation Grid */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
              <Link href={settings.heroButtonLink || "/events"}>
                <Button size="lg" className="gap-2 shadow-lg shadow-[var(--brand)]/20">
                  <Sparkles className="w-4 h-4" />
                  <span>{settings.heroButtonText || "Explore Events"}</span>
                </Button>
              </Link>
              {settings.showScheduleNav && (
                <Link href="/schedule">
                  <Button variant="secondary" size="lg" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Schedule</span>
                  </Button>
                </Link>
              )}
              {settings.showResultsNav && (
                <Link href="/results">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>Leaderboard</span>
                  </Button>
                </Link>
              )}
              {settings.showAnnouncementsNav && (
                <Link href="/announcements">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Megaphone className="w-4 h-4" />
                    <span>Announcements</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Live Stats Strip */}
            {settings.showStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-12 text-center border-t border-[var(--border-subtle)]">
                <div className="p-3">
                  <p className="text-2xl sm:text-3xl font-black text-[var(--foreground)] font-mono">
                    {events.length > 0 ? `${events.length}+` : "15+"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Competitions</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl sm:text-3xl font-black text-[var(--foreground)] font-mono">
                    {houses.length > 0 ? houses.length : "4"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Fest Teams</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl sm:text-3xl font-black text-[var(--foreground)] font-mono">
                    {venues.length > 0 ? venues.length : "5+"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Campus Stages</p>
                </div>
                <div className="p-3">
                  <p className="text-2xl sm:text-3xl font-black text-emerald-500 font-mono">
                    LIVE
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Scoring & Portal</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. FESTIVAL INTRODUCTION & TEAMS */}
        <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand)]">
                  Championship Legacy
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--foreground)]">
                  Heritage Meets Glory.
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                  {settings.siteName || "IZAZOV 9.0"} is engineered around high-stakes inter-team and open campus rivalry. Every cultural victory, coding breakthrough, debate win, and esports triumph contributes points toward the prestigious Fest Cup.
                </p>
                <div className="pt-2">
                  <Link href="/results">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <span>View Team Championship Standings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Teams Showcase */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {(houses.length > 0
                  ? houses
                  : [
                      {
                        id: "1",
                        name: "Phoenix",
                        shortName: "PHX",
                        description: "Flames & Innovation",
                      },
                      {
                        id: "2",
                        name: "Pegasus",
                        shortName: "PEG",
                        description: "Vision & Culture",
                      },
                      {
                        id: "3",
                        name: "Orion",
                        shortName: "ORN",
                        description: "Strategy & Intellect",
                      },
                      {
                        id: "4",
                        name: "Hydra",
                        shortName: "HYD",
                        description: "Resilience & Power",
                      },
                    ]
                ).map((h) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-[var(--brand)] transition shadow-[var(--shadow-card)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-[var(--foreground)] text-base">{h.name}</h4>
                      {h.shortName && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--brand-muted)] border border-[var(--brand)]/30 text-[var(--brand)] font-bold">
                          {h.shortName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      {h.description || "Faction contender"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. EVENT CATEGORIES */}
        <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--background)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand)]">
                  Disciplines & Tracks
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight mt-1">
                  Explore Event Categories
                </h2>
              </div>
              <Link
                href="/events"
                className="text-xs text-[var(--brand)] hover:underline font-semibold flex items-center gap-1"
              >
                View all events <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/events?category=${encodeURIComponent(cat.name)}`}
                  className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--brand)] hover:bg-[var(--surface-elevated)] transition group shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Sparkles
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      style={{ color: cat.color || "var(--brand)" }}
                    />
                    {cat.color && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)]">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-1">
                    {cat.description || "View competitions & rules"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. UPCOMING / FEATURED EVENTS */}
        {settings.showFeaturedEvents && (
          <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand)]">
                    Mainstage Showdowns
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight mt-1">
                    Featured Competitions
                  </h2>
                </div>
                <Link
                  href="/events"
                  className="text-xs text-[var(--brand)] hover:underline font-semibold flex items-center gap-1"
                >
                  Browse complete catalog <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {events.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] rounded-2xl border border-dashed border-[var(--border-strong)]">
                  Events schedule being finalized by festival committee.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.slice(0, 6).map((evt) => (
                    <Card
                      key={evt.id}
                      className="flex flex-col justify-between hover:border-[var(--brand)] transition group"
                    >
                      <CardHeader className="py-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Badge variant="primary" className="text-[10px]">
                            {evt.code}
                          </Badge>
                          <StatusBadge status={evt.status} />
                        </div>
                        <CardTitle className="text-base group-hover:text-[var(--brand)] transition-colors">
                          {evt.name}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4 pt-0">
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                          {evt.description ||
                            "Participate in this signature competition."}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-subtle)]">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                            <span>{evt.type}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                            <span className="truncate">
                              {evt.venue?.name || "TBA"}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Link href={`/events/${evt.id}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full"
                            >
                              View Event Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. SCHEDULE PREVIEW */}
        {settings.showSchedule && (
          <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--background)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--brand)]" />
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                    Festival Schedule Preview
                  </h3>
                </div>
                <Link
                  href="/schedule"
                  className="text-xs text-[var(--brand)] hover:underline font-medium"
                >
                  Full timeline →
                </Link>
              </div>

              <Card>
                <CardContent className="p-0 divide-y divide-[var(--border-subtle)]">
                  {schedules.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] p-6 text-center">
                      Schedule slots will be released shortly.
                    </p>
                  ) : (
                    schedules.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 flex items-center justify-between hover:bg-[var(--surface-hover)] transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="primary"
                              className="text-[10px]"
                            >
                              {s.event.code}
                            </Badge>
                            <span className="text-xs font-semibold text-[var(--foreground)]">
                              {s.event.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] mt-1">
                            {formatDate(s.startTime)} •{" "}
                            {formatTime(s.startTime)} -{" "}
                            {formatTime(s.endTime)}
                            {s.venue && ` • ${s.venue.name}`}
                          </p>
                        </div>
                        <StatusBadge status={s.event.status} />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* 6. RESULTS LEADERBOARD TEASER */}
        {settings.showResults && results.length > 0 && (
          <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand)]">
                    Live Standings
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight mt-1">
                    Latest Competition Results
                  </h2>
                </div>
                <Link
                  href="/results"
                  className="text-xs text-[var(--brand)] hover:underline font-medium"
                >
                  Full leaderboard →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {results.map((res) => (
                  <Card key={res.id} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-black">
                        #{res.position || "—"}
                      </span>
                      <Badge variant="primary" className="text-[10px]">
                        {res.event.code}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-[var(--foreground)] text-sm truncate">
                      {res.participant?.name || "Participant / Team"}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                      {res.event.name}
                    </p>
                    <p className="text-xs font-mono font-bold text-[var(--foreground)] mt-2 pt-2 border-t border-[var(--border-subtle)]">
                      {res.totalMarks} Points
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 7. VENUES PREVIEW */}
        {venues.length > 0 && (
          <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--background)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand)]">
                    Campus Layout
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight mt-1">
                    Festival Arenas & Stages
                  </h2>
                </div>
                <Link
                  href="/venues"
                  className="text-xs text-[var(--brand)] hover:underline font-medium"
                >
                  View all venues →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {venues.map((v) => (
                  <Card key={v.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{v.name}</CardTitle>
                      <Badge variant="neutral" className="text-[10px]">
                        Cap: {v.capacity || "N/A"}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                      {v.description ||
                        "Campus stage host for competitions."}
                    </p>
                    <p className="text-xs text-[var(--text-dim)] flex items-center gap-1 pt-2 border-t border-[var(--border-subtle)]">
                      <MapPin className="w-3.5 h-3.5 text-[var(--brand)]" />
                      <span>{v.location || "Campus Grounds"}</span>
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 8. LATEST ANNOUNCEMENTS */}
        {settings.showAnnouncements && (
          <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[var(--brand)]" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand)]">
                      Official Broadcasts
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                      Festival Bulletins & Notices
                    </h3>
                  </div>
                </div>
                <Link
                  href="/announcements"
                  className="text-xs text-[var(--brand)] hover:underline font-medium"
                >
                  View all notices →
                </Link>
              </div>

              {announcements.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] rounded-2xl border border-dashed border-[var(--border-strong)]">
                  No announcements posted yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {announcements.map((a) => (
                    <Card
                      key={a.id}
                      className="p-5 space-y-3 hover:border-[var(--brand)] transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--foreground)] line-clamp-1">
                          {a.title}
                        </span>
                        <StatusBadge status={a.priority} />
                      </div>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                        {a.content}
                      </p>
                      <p className="text-[10px] text-[var(--text-dim)] pt-2 border-t border-[var(--border-subtle)]">
                        {formatDate(a.createdAt)}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 9. IMAGE GALLERY (DIRECTLY BELOW ANNOUNCEMENTS) */}
        {settings.showGallery !== false && (
          <HomeGallerySection
            initialImages={galleryImages}
            albums={galleryAlbums}
            title={settings.galleryTitle}
            subtitle={settings.gallerySubtitle}
            siteName={settings.siteName || "IZAZOV 9.0"}
          />
        )}

        {/* 10. CALL TO ACTION SECTION */}
        <section className="py-20 bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--background)] text-center border-b border-[var(--border-subtle)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] uppercase tracking-tight">
              Ready to Compete at {settings.siteName || "IZAZOV 9.0"}?
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              Explore competitions, coordinate with your Team Captains & Managers, and follow real-time schedule updates directly through the platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href={settings.heroButtonLink || "/events"}>
                <Button size="lg" className="shadow-lg shadow-[var(--brand)]/20">
                  {settings.heroButtonText || "Explore Events"}
                </Button>
              </Link>
              {settings.showScheduleNav && (
                <Link href="/schedule">
                  <Button variant="secondary" size="lg">
                    View Schedule
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  );
}
