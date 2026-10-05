"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Search,
  Scan,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/Table";
import {
  recordAttendance,
  checkInByQrToken,
} from "@/actions/attendance";
import { formatDate, formatTime, ATTENDANCE_STATUSES, AttendanceStatus } from "@/lib/constants";

export interface AttendanceRecord {
  id: string;
  participantId: string;
  eventId: string;
  status: AttendanceStatus;
  scannedAt: Date;
  notes: string | null;
  participant: {
    id: string;
    participantId: string;
    name: string;
    house: { name: string } | null;
  };
  event: {
    id: string;
    name: string;
    code: string;
  };
  checkedBy: {
    id: string;
    name: string;
  } | null;
}

export function AttendanceManagementClient({
  records,
  events = [],
}: {
  records: AttendanceRecord[];
  events: { id: string; name: string; code: string }[];
  participants?: { id: string; name: string; participantId: string; houseName?: string }[];
}) {
  const router = useRouter();

  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || "ALL");
  const [search, setSearch] = useState("");

  // QR Check-in Box state
  const [qrToken, setQrToken] = useState("");
  const [qrEventId, setQrEventId] = useState(events[0]?.id || "");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrMessage, setQrMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleQrCheckIn(e: React.FormEvent) {
    e.preventDefault();
    if (!qrToken.trim() || !qrEventId) return;

    setQrLoading(true);
    setQrMessage(null);

    try {
      const res = await checkInByQrToken({
        qrToken: qrToken.trim(),
        eventId: qrEventId,
      });

      if (!res.success) {
        setQrMessage({ type: "error", text: res.error || "Check-in failed" });
      } else {
        setQrMessage({
          type: "success",
          text: `Checked in: ${res.data?.participant.name} (${res.data?.participant.participantId})`,
        });
        setQrToken("");
        router.refresh();
      }
    } catch {
      setQrMessage({ type: "error", text: "Network error during check-in" });
    } finally {
      setQrLoading(false);
    }
  }

  async function handleStatusUpdate(
    participantId: string,
    eventId: string,
    status: AttendanceStatus
  ) {
    try {
      await recordAttendance({
        participantId,
        eventId,
        status,
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchEvent = selectedEvent === "ALL" || r.eventId === selectedEvent;
      const matchSearch =
        search === "" ||
        r.participant.name.toLowerCase().includes(search.toLowerCase()) ||
        r.participant.participantId.toLowerCase().includes(search.toLowerCase()) ||
        r.event.name.toLowerCase().includes(search.toLowerCase());
      return matchEvent && matchSearch;
    });
  }, [records, selectedEvent, search]);

  return (
    <div className="space-y-8">
      {/* Fast QR Scan Check-in Banner */}
      <Card className="border-[#931827]/40 bg-gradient-to-r from-[#171112] via-[#141213] to-[#1a1113]">
        <CardHeader className="py-4">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-[#931827]" />
            <CardTitle className="text-base">Fast QR Token / Gate Check-in</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <form onSubmit={handleQrCheckIn} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={qrEventId}
              onChange={(e) => setQrEventId(e.target.value)}
              aria-label="Check-in Event"
              className="rounded-xl border border-[#383334] bg-[#0c0b0c] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#931827]"
              required
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.code} - {e.name}
                </option>
              ))}
            </select>

            <Input
              value={qrToken}
              onChange={(e) => setQrToken(e.target.value)}
              placeholder="Paste or scan QR Token / Pass..."
              className="py-2"
              required
            />

            <Button type="submit" size="sm" isLoading={qrLoading} className="w-full">
              <QrCode className="w-4 h-4 mr-1.5" />
              Check In Participant
            </Button>
          </form>

          {qrMessage && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                qrMessage.type === "success"
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                  : "bg-red-950/40 border-red-800 text-red-300"
              }`}
            >
              {qrMessage.text}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Quick Entry & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            aria-label="Filter Attendance Event"
            className="rounded-xl border border-[#2f2b2c] bg-[#121112] px-3.5 py-2 text-xs text-zinc-300 outline-none focus:border-[#931827] cursor-pointer"
          >
            <option value="ALL">All Events Attendance</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} - {e.name}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by participant name / ID..."
              className="w-full rounded-xl border border-[#2f2b2c] bg-[#121112] pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#931827]"
            />
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-zinc-500" />}
          title="No attendance records found"
          description="Scan participant QR tokens at the gate or record attendance manually."
        />
      ) : (
        <>
          <div className="hidden md:block">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Participant</TableHeader>
                    <TableHeader>Event</TableHeader>
                    <TableHeader>Time Scanned</TableHeader>
                    <TableHeader>Verified By</TableHeader>
                    <TableHeader>Status</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-white text-xs">
                            {r.participant.name}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {r.participant.participantId}
                            {r.participant.house && ` • House ${r.participant.house.name}`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-white">
                            {r.event.name}
                          </p>
                          <Badge variant="primary" className="text-[10px]">
                            {r.event.code}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-zinc-300">
                          {formatDate(r.scannedAt)} • {formatTime(r.scannedAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-zinc-400">
                          {r.checkedBy?.name || "Gate Scanner"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <select
                          value={r.status}
                          onChange={(e) =>
                            handleStatusUpdate(
                              r.participantId,
                              r.eventId,
                              e.target.value as AttendanceStatus
                            )
                          }
                          aria-label="Attendance Status"
                          className="rounded-lg border border-[#383334] bg-[#1a1819] px-2 py-1 text-xs text-white outline-none focus:border-[#931827] cursor-pointer"
                        >
                          {ATTENDANCE_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          <div className="md:hidden space-y-3">
            {filteredRecords.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-[#2d292a] bg-[#141314] space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      {r.participant.name}
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      {r.participant.participantId} • {r.event.code}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-[11px] text-zinc-400">
                  {formatDate(r.scannedAt)} at {formatTime(r.scannedAt)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
