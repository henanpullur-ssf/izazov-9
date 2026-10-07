"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Trophy,
  Award,
  Medal,
  Flame,
} from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/Table";
import { ParticipantForm, HouseOption } from "./ParticipantForm";
import { formatDate, formatTime } from "@/lib/constants";

export interface ParticipantDetailData {
  id: string;
  participantId: string;
  rollNumber: string | null;
  name: string;
  gender: string | null;
  dateOfBirth: Date | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  qrToken: string;
  houseId: string | null;
  totalPoints: number;
  prizeSummary: {
    first: number;
    second: number;
    third: number;
    consolation: number;
    special: number;
    totalPrizes: number;
  };
  gradeSummary: Record<string, number>;
  house: { id: string; name: string } | null;
  registrations: {
    id: string;
    registration: {
      id: string;
      registrationNumber: string;
      status: string;
      teamName: string | null;
      event: {
        id: string;
        code: string;
        name: string;
        category: string | null;
        venue: { name: string } | null;
      };
    };
  }[];
  attendance: {
    id: string;
    status: string;
    scannedAt: Date;
    notes: string | null;
    event: { id: string; name: string; code: string };
    checkedBy: { name: string } | null;
  }[];
  results: {
    id: string;
    position: number | null;
    points: number;
    totalMarks: number;
    grade: string | null;
    prizeLevel: string | null;
    remarks: string | null;
    isWinner: boolean;
    isPublished: boolean;
    event: { id: string; name: string; code: string; category: string | null };
  }[];
}

export function ParticipantDetailClient({
  participant,
  houses,
}: {
  participant: ParticipantDetailData;
  houses: HouseOption[];
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="p-6 rounded-3xl border border-[#2f2b2c] bg-gradient-to-r from-[#191516] via-[#131112] to-[#121112] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-5">
          <div className="w-18 h-18 rounded-2xl bg-[#931827] border border-red-500/40 flex items-center justify-center text-3xl font-black text-white shadow-xl shrink-0">
            {participant.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#201d1e] border border-[#383334] text-red-400">
                ID: {participant.participantId}
              </span>
              {participant.rollNumber && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#201d1e] border border-[#383334] text-zinc-300">
                  Roll No: {participant.rollNumber}
                </span>
              )}
              {participant.house && (
                <Link href={`/admin/teams/${participant.house.id}`}>
                  <Badge variant="info" className="hover:opacity-80 transition cursor-pointer">
                    Team {participant.house.name}
                  </Badge>
                </Link>
              )}
              {participant.gender && (
                <Badge variant="neutral">{participant.gender}</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {participant.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Overall Performance Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Points */}
        <Card className="p-5 bg-gradient-to-br from-[#1c170f] to-[#121112] border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Total Fest Points
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-white">
              {participant.totalPoints}
            </span>
            <span className="text-xs text-zinc-400 font-semibold">pts earned</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Calculated from published event results
          </p>
        </Card>

        {/* 1st Prizes / Trophies */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              1st Prize / Winners
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
              {participant.prizeSummary.first}
            </span>
            <span className="text-xs text-zinc-400">championships</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Gold podium finishes
          </p>
        </Card>

        {/* 2nd & 3rd Prizes */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Runner-Up Podiums
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-500/10 border border-zinc-500/30 flex items-center justify-center text-zinc-300">
              <Medal className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-zinc-200">
                {participant.prizeSummary.second}
              </span>
              <span className="text-[10px] text-zinc-400">🥈 2nd</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-amber-600">
                {participant.prizeSummary.third}
              </span>
              <span className="text-[10px] text-zinc-400">🥉 3rd</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Silver and bronze podium placements
          </p>
        </Card>

        {/* Grade Summary Count */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Grade Distribution
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {Object.keys(participant.gradeSummary).length === 0 ? (
              <span className="text-xs text-zinc-500">No grades recorded yet</span>
            ) : (
              Object.entries(participant.gradeSummary).map(([grade, count]) => (
                <span
                  key={grade}
                  className="px-2 py-0.5 rounded-md bg-[#1d1b1c] border border-[#383334] text-xs font-mono font-bold text-emerald-400"
                >
                  {grade}: {count}
                </span>
              ))
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Official performance grade marks
          </p>
        </Card>
      </div>

      {/* Complete Event-Wise Result History */}
      <Card className="overflow-hidden">
        <CardHeader className="py-4 bg-[#141213] border-b border-[#232021] flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#931827]" />
              <span>Event-Wise Result History</span>
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-0.5">
              Complete breakdown of points, grades, prizes, and remarks awarded for each competition.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-[#201d1e] text-zinc-300 border border-[#332f30]">
            {participant.results.length} results recorded
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {participant.results.length === 0 ? (
            <p className="text-xs text-zinc-500 p-8 text-center">
              No competition results have been recorded for this participant yet.
            </p>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Event</TableHeader>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Grade</TableHeader>
                    <TableHeader>Prize Level</TableHeader>
                    <TableHeader>Points Awarded</TableHeader>
                    <TableHeader>Status / Remarks</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {participant.results.map((res) => (
                    <TableRow key={res.id} className={!res.isPublished ? "opacity-50" : ""}>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="font-bold text-white text-sm">
                            {res.event.name}
                          </span>
                          <p className="text-xs font-mono text-[#931827]">
                            {res.event.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {res.event.category ? (
                          <Badge variant="neutral">{res.event.category}</Badge>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {res.grade ? (
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                            {res.grade}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {res.prizeLevel && res.prizeLevel !== "No Prize" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                            <Trophy className="w-3 h-3" />
                            {res.prizeLevel}
                          </span>
                        ) : res.position ? (
                          <span className="text-xs font-semibold text-zinc-400">
                            Rank #{res.position}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono font-black text-white">
                          {res.points} pts
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {res.isPublished ? (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-900/30 text-emerald-400">
                                Published
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                                Unpublished
                              </span>
                            )}
                          </div>
                          {res.remarks && (
                            <p className="text-[11px] text-zinc-400 italic">
                              &ldquo;{res.remarks}&rdquo;
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Info & Pass Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact & Bio Info */}
        <Card className="md:col-span-2">
          <CardHeader className="py-4">
            <CardTitle className="text-base">Personal & Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-zinc-500 font-medium uppercase tracking-wider">
                  Roll Number
                </p>
                <p className="text-sm font-semibold text-white">
                  {participant.rollNumber || "Not recorded"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-zinc-500 font-medium uppercase tracking-wider">
                  Assigned Team
                </p>
                <p className="text-sm font-semibold text-white">
                  {participant.house ? `Team ${participant.house.name}` : "No Team"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-zinc-500 font-medium uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <span>{participant.email || "Not provided"}</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-zinc-500 font-medium uppercase tracking-wider">
                  Phone Number
                </p>
                <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-zinc-400" />
                  <span>{participant.phone || "Not provided"}</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-zinc-500 font-medium uppercase tracking-wider">
                  Date of Birth
                </p>
                <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span>{formatDate(participant.dateOfBirth)}</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-zinc-500 font-medium uppercase tracking-wider">
                  Department / Address
                </p>
                <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span>{participant.address || "Not specified"}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Security Pass */}
        <Card className="flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="p-4 rounded-2xl bg-[#201d1e] border-2 border-[#931827]">
            <QrCode className="w-24 h-24 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">
              Official QR Check-in Pass
            </p>
            <p className="text-[10px] text-zinc-400">
              Scannable at venue gates
            </p>
          </div>
          <div className="w-full p-2.5 rounded-xl bg-[#0d0c0d] border border-[#272425]">
            <p className="text-[10px] text-zinc-500 uppercase font-semibold">
              Token
            </p>
            <p className="text-xs font-mono text-zinc-300 break-all select-all">
              {participant.qrToken}
            </p>
          </div>
        </Card>
      </div>

      {/* Two Column: Registered Events & Attendance History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registered Events */}
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base">Registered Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-[#231f20]">
            {participant.registrations.length === 0 ? (
              <p className="text-xs text-zinc-500 p-6 text-center">
                Not registered in any events yet.
              </p>
            ) : (
              participant.registrations.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#931827]">
                        {r.registration.event.code}
                      </span>
                      <Link
                        href={`/admin/events/${r.registration.event.id}`}
                        className="text-xs font-semibold text-white hover:underline"
                      >
                        {r.registration.event.name}
                      </Link>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Reg: {r.registration.registrationNumber}
                      {r.registration.teamName && ` • Entry: ${r.registration.teamName}`}
                      {r.registration.event.venue && ` • ${r.registration.event.venue.name}`}
                    </p>
                  </div>
                  <StatusBadge status={r.registration.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base">Attendance History</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-[#231f20]">
            {participant.attendance.length === 0 ? (
              <p className="text-xs text-zinc-500 p-6 text-center">
                No attendance scans recorded yet.
              </p>
            ) : (
              participant.attendance.map((att) => (
                <div key={att.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {att.event.name} ({att.event.code})
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Scanned: {formatDate(att.scannedAt)} • {formatTime(att.scannedAt)}
                      {att.checkedBy && ` by ${att.checkedBy.name}`}
                    </p>
                  </div>
                  <StatusBadge status={att.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Participant"
        maxWidth="lg"
      >
        <ParticipantForm
          initialData={{
            ...participant,
            rollNumber: participant.rollNumber || undefined,
          }}
          houses={houses}
          isEdit={true}
        />
      </Modal>
    </div>
  );
}
