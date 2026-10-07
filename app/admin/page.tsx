import React from "react";
import Link from "next/link";
import {
  Users,
  Sparkles,
  Calendar,
  Radio,
  CheckCircle2,
  MapPin,
  HeartHandshake,
  Award,
  PlusCircle,
  Megaphone,
  Trophy,
  ArrowRight,
  Clock,
} from "lucide-react";
import { getDashboardStats } from "@/actions/dashboard";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const result = await getDashboardStats();
  const stats = result.data;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[#2e292a] bg-gradient-to-r from-[#171516] via-[#141213] to-[#1e1315]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#931827]">
              IZAZOV 9.0 Operations Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Festival Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time management for events, participants, scoring, and campus venues.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/admin/events/new">
            <Button size="sm" className="gap-1.5">
              <PlusCircle className="w-4 h-4" />
              <span>New Event</span>
            </Button>
          </Link>
          <Link href="/admin/participants/new">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Users className="w-4 h-4" />
              <span>Add Participant</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Summary Stat Cards Grid (8 core metrics) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Overview Statistics
          </h2>
          <span className="text-xs text-zinc-500">Live Database Feed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Participants"
            value={stats.totalParticipants}
            subtitle="Registered across teams"
            icon={<Users className="w-5 h-5" />}
            highlight={stats.totalParticipants > 0}
          />
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            subtitle={`${stats.totalRegistrations} total registrations`}
            icon={<Sparkles className="w-5 h-5" />}
          />
          <StatCard
            title="Live Events"
            value={stats.liveEventsCount}
            subtitle="Currently in progress"
            icon={<Radio className="w-5 h-5 text-emerald-400 animate-pulse" />}
            highlight={stats.liveEventsCount > 0}
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEventsCount}
            subtitle="Scheduled ahead"
            icon={<Calendar className="w-5 h-5" />}
          />
          <StatCard
            title="Completed Events"
            value={stats.completedEventsCount}
            subtitle="Finished & scored"
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
          <StatCard
            title="Campus Venues"
            value={stats.totalVenues}
            subtitle="Configured stages/halls"
            icon={<MapPin className="w-5 h-5" />}
          />
          <StatCard
            title="Active Volunteers"
            value={stats.totalVolunteers}
            subtitle="Duty assignments"
            icon={<HeartHandshake className="w-5 h-5" />}
          />
          <StatCard
            title="Panel Judges"
            value={stats.totalJudges}
            subtitle="Assigned to categories"
            icon={<Award className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Quick Actions Panel */}
      <Card>
        <CardHeader className="py-4 px-5 sm:px-6">
          <CardTitle className="text-sm uppercase tracking-wider text-zinc-400 font-semibold">
            Quick Operational Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/events/new"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#2d292a] bg-[#161415] hover:border-[#931827] hover:bg-[#1f1618] transition text-center group"
          >
            <Sparkles className="w-5 h-5 text-[#931827] mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">Create Event</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Code & rules</span>
          </Link>

          <Link
            href="/admin/participants/new"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#2d292a] bg-[#161415] hover:border-[#931827] hover:bg-[#1f1618] transition text-center group"
          >
            <Users className="w-5 h-5 text-red-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">Add Participant</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Team & QR</span>
          </Link>

          <Link
            href="/admin/schedule"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#2d292a] bg-[#161415] hover:border-[#931827] hover:bg-[#1f1618] transition text-center group"
          >
            <Clock className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">Create Schedule</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Time slots</span>
          </Link>

          <Link
            href="/admin/venues"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#2d292a] bg-[#161415] hover:border-[#931827] hover:bg-[#1f1618] transition text-center group"
          >
            <MapPin className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">Add Venue</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Halls & stages</span>
          </Link>

          <Link
            href="/admin/announcements"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#2d292a] bg-[#161415] hover:border-[#931827] hover:bg-[#1f1618] transition text-center group"
          >
            <Megaphone className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">Publish Notice</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Broadcast</span>
          </Link>

          <Link
            href="/admin/scoring"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#2d292a] bg-[#161415] hover:border-[#931827] hover:bg-[#1f1618] transition text-center group"
          >
            <Trophy className="w-5 h-5 text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-white">Enter Results</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Judges & marks</span>
          </Link>
        </CardContent>
      </Card>

      {/* Main Dashboard Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upcoming Schedules & Events Overview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5 sm:px-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#931827]" />
                <CardTitle className="text-base">Upcoming Schedule Timeline</CardTitle>
              </div>
              <Link
                href="/admin/schedule"
                className="text-xs text-[#931827] hover:underline flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-[#231f20]">
              {stats.upcomingSchedules.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500">
                  No upcoming schedule slots configured yet.
                  <div className="mt-3">
                    <Link href="/admin/schedule">
                      <Button size="sm" variant="outline">
                        Create Schedule Entry
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                stats.upcomingSchedules.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#181617] transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {item.event.name}
                        </span>
                        <Badge variant="primary">{item.event.code}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        {item.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            {item.venue.name}
                          </span>
                        )}
                        <span>
                          {formatDate(item.startTime)} • {formatTime(item.startTime)}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={item.event.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Event Status Distribution */}
          <Card>
            <CardHeader className="py-4 px-5 sm:px-6">
              <CardTitle className="text-base">Event Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#181617] border border-[#2c2829] text-center">
                  <p className="text-xs text-zinc-400 uppercase font-medium">Draft</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {stats.eventsByStatus.find((s) => s.status === "DRAFT")?._count?.status || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#181617] border border-[#2c2829] text-center">
                  <p className="text-xs text-amber-400 uppercase font-medium">Upcoming</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {stats.upcomingEventsCount}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#181617] border border-[#2c2829] text-center">
                  <p className="text-xs text-emerald-400 uppercase font-medium">Live</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {stats.liveEventsCount}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#181617] border border-[#2c2829] text-center">
                  <p className="text-xs text-cyan-400 uppercase font-medium">Completed</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {stats.completedEventsCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recent Registrations & Announcements */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5 sm:px-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#931827]" />
                <CardTitle className="text-base">Recent Registrations</CardTitle>
              </div>
              <Link
                href="/admin/registrations"
                className="text-xs text-[#931827] hover:underline flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-[#231f20]">
              {stats.recentRegistrations.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500">
                  No registrations recorded yet.
                  <div className="mt-3">
                    <Link href="/admin/registrations">
                      <Button size="sm" variant="outline">
                        Register Participants
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                stats.recentRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#181617] transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-400">
                          {reg.registrationNumber}
                        </span>
                        <span className="text-sm font-medium text-white">
                          {reg.teamName || reg.participants[0]?.participant?.name || "Participant"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Event: <span className="text-zinc-300">{reg.event.name}</span>
                        {reg.participants[0]?.participant?.house && (
                          <span className="ml-2 text-zinc-500">
                            • Team: {reg.participants[0]?.participant?.house.name}
                          </span>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={reg.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Latest Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5 sm:px-6">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#931827]" />
                <CardTitle className="text-base">Latest Announcements</CardTitle>
              </div>
              <Link
                href="/admin/announcements"
                className="text-xs text-[#931827] hover:underline flex items-center gap-1 font-medium"
              >
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-[#231f20]">
              {stats.latestAnnouncements.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500">
                  No announcements published yet.
                  <div className="mt-3">
                    <Link href="/admin/announcements">
                      <Button size="sm" variant="outline">
                        Publish First Notice
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                stats.latestAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:px-6 space-y-1.5 hover:bg-[#181617] transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.isPinned && (
                          <Badge variant="warning" className="text-[10px]">
                            PINNED
                          </Badge>
                        )}
                        <span className="text-sm font-semibold text-white">
                          {item.title}
                        </span>
                      </div>
                      <StatusBadge status={item.priority} />
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {item.content}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
