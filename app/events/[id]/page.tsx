import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Users,
  Clock,
  Calendar,
  Award,
  ChevronLeft,
} from "lucide-react";
import { getEventById } from "@/actions/events";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatDate, formatTime, FEST_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getEventById(id);
  if (!res.success || !res.data) {
    return { title: `Event | ${FEST_NAME}` };
  }
  return {
    title: `${res.data.name} (${res.data.code}) | ${FEST_NAME}`,
    description: res.data.description || "Festival Competition Details",
  };
}

export default async function PublicEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getEventById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const event = res.data;

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col selection:bg-[#931827]">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-[#2e2a2b] bg-gradient-to-br from-[#181315] via-[#121112] to-[#151012] space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#931827] text-white">
                {event.code}
              </span>
              <Badge variant="primary">{event.category || "Competition"}</Badge>
              <Badge variant="neutral">{event.type}</Badge>
              <StatusBadge status={event.status} />
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              {event.name}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
              {event.description ||
                "Official guidelines and rules will be distributed by event coordinators prior to the competition round."}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#262223]">
            <div className="p-3 rounded-xl bg-[#111011] border border-[#272425]">
              <p className="text-[10px] uppercase font-bold text-zinc-500">
                Participation Type
              </p>
              <p className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-red-400" />
                <span>
                  {event.type} (max {event.maxParticipants || 1})
                </span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#111011] border border-[#272425]">
              <p className="text-[10px] uppercase font-bold text-zinc-500">
                Estimated Duration
              </p>
              <p className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>
                  {event.durationMinutes ? `${event.durationMinutes} mins` : "TBD"}
                </span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#111011] border border-[#272425]">
              <p className="text-[10px] uppercase font-bold text-zinc-500">
                Assigned Venue
              </p>
              <p className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5 truncate">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{event.venue?.name || "TBA"}</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#111011] border border-[#272425]">
              <p className="text-[10px] uppercase font-bold text-zinc-500">
                Current Status
              </p>
              <p className="text-sm font-semibold text-white mt-1">
                {event.status}
              </p>
            </div>
          </div>
        </div>

        {/* Schedule & Registration Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Schedule Timetable */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#931827]" />
                  <CardTitle className="text-base">Event Schedule & Rounds</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-[#231f20]">
                {event.schedules.length === 0 ? (
                  <p className="text-xs text-zinc-500 p-6 text-center">
                    Schedule slots will be published soon.
                  </p>
                ) : (
                  event.schedules.map((s) => (
                    <div key={s.id} className="p-4 sm:px-6 space-y-1">
                      <p className="text-sm font-semibold text-white">
                        {formatDate(s.startTime)} • {formatTime(s.startTime)} -{" "}
                        {formatTime(s.endTime)}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Venue: {s.venue?.name || event.venue?.name || "Main Campus"}
                        {s.notes && ` • ${s.notes}`}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Results / Podium if finalized */}
            {event.results.length > 0 && (
              <Card className="border-amber-500/40 bg-gradient-to-r from-[#17130c] to-[#121112]">
                <CardHeader className="py-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <CardTitle className="text-base">Official Results</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3">
                  {event.results.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl border border-[#332f30] bg-[#141213] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            res.position === 1
                              ? "bg-amber-500 text-black"
                              : res.position === 2
                              ? "bg-zinc-300 text-black"
                              : res.position === 3
                              ? "bg-amber-800 text-white"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          #{res.position}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {res.participant?.name || "Participant / Team"}
                          </p>
                          {res.participant?.house && (
                            <p className="text-[10px] text-zinc-400">
                              House: {res.participant.house.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">
                        {String(res.totalMarks)} pts
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Col: Registration Card */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4 border-[#332e30]">
              <CardTitle className="text-base">Registration Notice</CardTitle>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Participation is organized through campus house nominations and registered attendee passes.
              </p>

              <div className="p-3 rounded-xl bg-[#0e0d0e] border border-[#272425] text-xs space-y-1.5">
                <p className="font-semibold text-zinc-300">Rules & Eligibility</p>
                <ul className="list-disc pl-4 text-zinc-400 space-y-1 text-[11px]">
                  <li>Valid Student ID card required at gate.</li>
                  <li>Report 15 minutes before round time.</li>
                  <li>House points awarded to top 3 positions.</li>
                </ul>
              </div>

              <div className="pt-2">
                <Link href="/login">
                  <Button className="w-full" size="sm">
                    Coordinator Registration Portal
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
