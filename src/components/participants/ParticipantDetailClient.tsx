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
} from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ParticipantForm, HouseOption } from "./ParticipantForm";
import { formatDate, formatTime } from "@/lib/constants";

export interface ParticipantDetailData {
  id: string;
  participantId: string;
  name: string;
  gender: string | null;
  dateOfBirth: Date | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  qrToken: string;
  houseId: string | null;
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
    totalMarks: unknown;
    isWinner: boolean;
    event: { id: string; name: string; code: string };
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
      <div className="p-6 rounded-2xl border border-[#2f2b2c] bg-gradient-to-r from-[#171516] to-[#121112] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#931827] border border-red-500/30 flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
            {participant.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#201d1e] border border-[#383334] text-red-400">
                {participant.participantId}
              </span>
              {participant.house && (
                <Badge variant="info">House {participant.house.name}</Badge>
              )}
              {participant.gender && (
                <Badge variant="neutral">{participant.gender}</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
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

      {/* Info & Pass Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact & Bio Info */}
        <Card className="md:col-span-2">
          <CardHeader className="py-4">
            <CardTitle className="text-base">Participant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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

      {/* Two Column History */}
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
                      {r.registration.teamName && ` • Team: ${r.registration.teamName}`}
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
                      Scanned at: {formatDate(att.scannedAt)} • {formatTime(att.scannedAt)}
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
          initialData={participant}
          houses={houses}
          isEdit={true}
        />
      </Modal>
    </div>
  );
}
