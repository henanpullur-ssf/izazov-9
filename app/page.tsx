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
import { getHouses } from "@/actions/settings";
import {
  FEST_NAME,
  FEST_DATES,
  EVENT_CATEGORIES,
  formatDate,
  formatTime,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    eventsRes,
    schedulesRes,
    announcementsRes,
    resultsRes,
    venuesRes,
    housesRes,
  ] = await Promise.all([
    getEvents(),
    getSchedules(),
    getAnnouncements(true),
    getResults(),
    getVenues(),
    getHouses(),
  ]);

  const events = eventsRes.data || [];
  const schedules = (schedulesRes.data || []).slice(0, 4);
  const announcements = (announcementsRes.data || []).slice(0, 3);
  const results = (resultsRes.data || []).slice(0, 4);
  const venues = (venuesRes.data || []).slice(0, 3);
  const houses = housesRes.data || [];

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col selection:bg-[#931827]">
      <PublicNavbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden border-b border-[#242122] py-20 sm:py-32 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(147,24,39,0.25),transparent)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#931827]/40 bg-[#931827]/15 text-xs font-semibold text-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>THE 9TH EDITION • {FEST_DATES}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight uppercase max-w-4xl mx-auto leading-[1.05]">
              IGNITE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-[#931827] to-red-400">ARENA</span>
              <br />
              <span className="text-white">{FEST_NAME}</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              The flagship campus festival uniting cultural spectacles, 24-hour hackathons, esports battles, literary arenas, and the four-house championship.
            </p>

            {/* Quick Action Navigation Grid */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
              <Link href="/events">
                <Button size="lg" className="gap-2 shadow-xl shadow-[#931827]/30">
                  <Sparkles className="w-4 h-4" />
                  <span>Explore Events</span>
                </Button>
              </Link>
              <Link href="/schedule">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </Button>
              </Link>
              <Link href="/results">
                <Button variant="outline" size="lg" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>Leaderboard</span>
                </Button>
              </Link>
              <Link href="/announcements">
                <Button variant="outline" size="lg" className="gap-2">
                  <Megaphone className="w-4 h-4" />
                  <span>Announcements</span>
                </Button>
              </Link>
            </div>

            {/* Live Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-12 text-center border-t border-[#232021]/80">
              <div className="p-3">
                <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {events.length > 0 ? `${events.length}+` : "15+"}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">Competitions</p>
              </div>
              <div className="p-3">
                <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {houses.length > 0 ? houses.length : "4"}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">Campus Houses</p>
              </div>
              <div className="p-3">
                <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {venues.length > 0 ? venues.length : "5+"}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">Campus Stages</p>
              </div>
              <div className="p-3">
                <p className="text-2xl sm:text-3xl font-black text-red-500 font-mono">
                  LIVE
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">Scoring & Portal</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. FESTIVAL INTRODUCTION & HOUSES */}
        <section className="py-16 sm:py-20 border-b border-[#232021] bg-[#0c0b0c]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#931827]">
                  Championship Legacy
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Four Houses. One Ultimate Trophy.
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  IZAZOV 9.0 is engineered around high-stakes inter-house and open campus rivalry. Every dance victory, coding breakthrough, debate win, and esports triumph contributes points toward the prestigious IZAZOV Fest Cup.
                </p>
                <div className="pt-2">
                  <Link href="/about">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <span>Learn about the House System & Rules</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Houses Showcase */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {(houses.length > 0 ? houses : [
                  { id: "1", name: "Phoenix", shortName: "PHX", description: "Flames & Innovation" },
                  { id: "2", name: "Pegasus", shortName: "PEG", description: "Vision & Culture" },
                  { id: "3", name: "Orion", shortName: "ORN", description: "Strategy & Intellect" },
                  { id: "4", name: "Hydra", shortName: "HYD", description: "Resilience & Power" },
                ]).map((h) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-2xl border border-[#2a2627] bg-[#141314] hover:border-[#931827] transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white text-base">{h.name}</h4>
                      {h.shortName && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#931827]/20 border border-[#931827]/40 text-red-300">
                          {h.shortName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">
                      {h.description || "Faction contender"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. EVENT CATEGORIES */}
        <section className="py-16 sm:py-20 border-b border-[#232021] bg-[#000000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#931827]">
                  Disciplines & Tracks
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                  Explore Event Categories
                </h2>
              </div>
              <Link href="/events" className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1">
                View all events <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {EVENT_CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/events?category=${encodeURIComponent(cat)}`}
                  className="p-5 rounded-2xl border border-[#272425] bg-[#121112] hover:border-[#931827] hover:bg-[#181214] transition group"
                >
                  <Sparkles className="w-5 h-5 text-[#931827] mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {cat}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    View competitions & rules
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. UPCOMING EVENTS */}
        <section className="py-16 sm:py-20 border-b border-[#232021] bg-[#0e0d0e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#931827]">
                  Mainstage Showdowns
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                  Featured Competitions
                </h2>
              </div>
              <Link href="/events" className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1">
                Browse complete catalog <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 rounded-2xl border border-dashed border-[#2d292a]">
                Events schedule being finalized by festival committee.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.slice(0, 6).map((evt) => (
                  <Card
                    key={evt.id}
                    className="flex flex-col justify-between hover:border-[#931827] transition group"
                  >
                    <CardHeader className="py-4">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant="primary" className="text-[10px]">
                          {evt.code}
                        </Badge>
                        <StatusBadge status={evt.status} />
                      </div>
                      <CardTitle className="text-base group-hover:text-red-400 transition-colors">
                        {evt.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {evt.description || "Participate in this signature competition."}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 pt-3 border-t border-[#232021]">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{evt.type}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="truncate">{evt.venue?.name || "TBA"}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link href={`/events/${evt.id}`}>
                          <Button variant="secondary" size="sm" className="w-full">
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

        {/* 5. SCHEDULE PREVIEW & ANNOUNCEMENTS TWO-COL */}
        <section className="py-16 sm:py-20 border-b border-[#232021] bg-[#000000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Schedule Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#931827]" />
                    <h3 className="text-lg font-bold text-white">
                      Festival Schedule Preview
                    </h3>
                  </div>
                  <Link href="/schedule" className="text-xs text-red-400 hover:underline font-medium">
                    Full timeline →
                  </Link>
                </div>

                <Card>
                  <CardContent className="p-0 divide-y divide-[#231f20]">
                    {schedules.length === 0 ? (
                      <p className="text-xs text-zinc-500 p-6 text-center">
                        Schedule slots will be released shortly.
                      </p>
                    ) : (
                      schedules.map((s) => (
                        <div key={s.id} className="p-4 flex items-center justify-between hover:bg-[#161415] transition">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="primary" className="text-[10px]">
                                {s.event.code}
                              </Badge>
                              <span className="text-xs font-semibold text-white">
                                {s.event.name}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1">
                              {formatDate(s.startTime)} • {formatTime(s.startTime)} - {formatTime(s.endTime)}
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

              {/* Latest Announcements */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#931827]" />
                    <h3 className="text-lg font-bold text-white">
                      Official Bulletins
                    </h3>
                  </div>
                  <Link href="/announcements" className="text-xs text-red-400 hover:underline font-medium">
                    View all notices →
                  </Link>
                </div>

                <Card>
                  <CardContent className="p-0 divide-y divide-[#231f20]">
                    {announcements.length === 0 ? (
                      <p className="text-xs text-zinc-500 p-6 text-center">
                        No announcements posted yet.
                      </p>
                    ) : (
                      announcements.map((a) => (
                        <div key={a.id} className="p-4 space-y-1.5 hover:bg-[#161415] transition">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white line-clamp-1">
                              {a.title}
                            </span>
                            <StatusBadge status={a.priority} />
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {a.content}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {formatDate(a.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 6. RESULTS LEADERBOARD TEASER */}
        {results.length > 0 && (
          <section className="py-16 sm:py-20 border-b border-[#232021] bg-[#0c0b0c]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#931827]">
                    Live Standings
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                    Latest Competition Results
                  </h2>
                </div>
                <Link href="/results" className="text-xs text-red-400 hover:underline font-medium">
                  Full leaderboard →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {results.map((res) => (
                  <Card key={res.id} className="p-4 border-[#332e30]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-black">
                        #{res.position || "—"}
                      </span>
                      <Badge variant="primary" className="text-[10px]">
                        {res.event.code}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-white text-sm truncate">
                      {res.participant?.name || "Participant / Team"}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">
                      {res.event.name}
                    </p>
                    <p className="text-xs font-mono font-bold text-white mt-2 pt-2 border-t border-[#232021]">
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
          <section className="py-16 sm:py-20 border-b border-[#232021] bg-[#000000]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#931827]">
                    Campus Layout
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                    Festival Arenas & Stages
                  </h2>
                </div>
                <Link href="/venues" className="text-xs text-red-400 hover:underline font-medium">
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
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {v.description || "Campus stage host for IZAZOV 9.0 competitions."}
                    </p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 pt-2 border-t border-[#232021]">
                      <MapPin className="w-3.5 h-3.5 text-[#931827]" />
                      <span>{v.location || "Campus Grounds"}</span>
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 8. CALL TO ACTION SECTION */}
        <section className="py-20 bg-gradient-to-b from-[#141011] to-[#0a0809] text-center border-b border-[#232021]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Ready to Compete at {FEST_NAME}?
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Explore competitions, coordinate with your House Captains, and follow real-time schedule updates directly through the platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/events">
                <Button size="lg" className="shadow-lg shadow-[#931827]/30">
                  Explore Events
                </Button>
              </Link>
              <Link href="/schedule">
                <Button variant="secondary" size="lg">
                  View Schedule
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
