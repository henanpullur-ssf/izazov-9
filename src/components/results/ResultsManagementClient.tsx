"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { saveResult, deleteResult } from "@/actions/results";

export interface ResultItem {
  id: string;
  eventId: string;
  registrationId: string;
  participantId: string | null;
  position: number | null;
  totalMarks: number;
  isWinner: boolean;
  event: {
    id: string;
    code: string;
    name: string;
    category: string | null;
  };
  participant: {
    name: string;
    house: { name: string } | null;
  } | null;
  registration: {
    id: string;
    registrationNumber: string;
    teamName: string | null;
    participants: {
      participant: {
        id: string;
        name: string;
        house: { name: string } | null;
      };
    }[];
  };
}

export function ResultsManagementClient({
  results,
  events = [],
}: {
  results: ResultItem[];
  events: {
    id: string;
    name: string;
    code: string;
    registrations: {
      id: string;
      registrationNumber: string;
      teamName: string | null;
      participants: { participant: { id: string; name: string } }[];
    }[];
  }[];
}) {
  const router = useRouter();

  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "ALL");
  const [isAddResultOpen, setIsAddResultOpen] = useState(false);

  // Add Result Form
  const [formEventId, setFormEventId] = useState(events[0]?.id || "");
  const [formRegId, setFormRegId] = useState("");
  const [position, setPosition] = useState("1");
  const [totalMarks, setTotalMarks] = useState("");
  const [isWinner, setIsWinner] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentFormEvent = events.find((e) => e.id === formEventId);

  async function handleSaveResult(e: React.FormEvent) {
    e.preventDefault();
    if (!formEventId || !formRegId || !totalMarks) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    const reg = currentFormEvent?.registrations.find((r) => r.id === formRegId);
    const participantId = reg?.participants[0]?.participant?.id;

    try {
      const res = await saveResult({
        eventId: formEventId,
        registrationId: formRegId,
        participantId,
        position: position ? parseInt(position, 10) : undefined,
        totalMarks: parseFloat(totalMarks),
        isWinner,
      });

      if (!res.success) {
        setError(res.error || "Failed to save result");
      } else {
        setIsAddResultOpen(false);
        setTotalMarks("");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteResult(id);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  const filteredResults = results.filter((r) => {
    return selectedEventId === "ALL" || r.eventId === selectedEventId;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          aria-label="Filter Results by Event"
          className="rounded-xl border border-[#2f2b2c] bg-[#121112] px-3.5 py-2 text-xs text-zinc-300 outline-none focus:border-[#931827] cursor-pointer max-w-sm"
        >
          <option value="ALL">All Competitions Results</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.code} - {e.name}
            </option>
          ))}
        </select>

        <Button
          onClick={() => {
            setFormEventId(events[0]?.id || "");
            setFormRegId(events[0]?.registrations[0]?.id || "");
            setIsAddResultOpen(true);
          }}
          size="sm"
          className="gap-1.5 whitespace-nowrap"
        >
          <Trophy className="w-4 h-4" />
          <span>Publish Official Result</span>
        </Button>
      </div>

      {filteredResults.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-6 h-6 text-zinc-500" />}
          title="No results published"
          description="Publish final scores, ranks, and winners for completed competitions."
          actionLabel="Publish Result"
          onAction={() => setIsAddResultOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredResults.map((res) => (
            <Card
              key={res.id}
              className={`p-4 sm:p-5 transition ${
                res.position === 1
                  ? "border-amber-500/40 bg-gradient-to-r from-[#1b1710] to-[#121112]"
                  : "hover:border-[#383334]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                      res.position === 1
                        ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                        : res.position === 2
                        ? "bg-zinc-300 text-black"
                        : res.position === 3
                        ? "bg-amber-800 text-white"
                        : "bg-[#231f20] text-zinc-400 border border-[#383334]"
                    }`}
                  >
                    {res.position ? `#${res.position}` : "—"}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm sm:text-base">
                        {res.registration.teamName ||
                          res.participant?.name ||
                          res.registration.participants[0]?.participant?.name ||
                          "Participant"}
                      </span>
                      <Badge variant="primary" className="text-[10px]">
                        {res.event.code}
                      </Badge>
                      {res.isWinner && (
                        <Badge variant="warning" className="text-[10px]">
                          WINNER
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400">
                      Competition: <span className="text-zinc-200">{res.event.name}</span>
                      {res.participant?.house && (
                        <span className="ml-2 text-zinc-500">
                          • House: {res.participant.house.name}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-mono font-bold text-white">
                      {res.totalMarks}
                    </span>
                    <p className="text-[10px] text-zinc-500 uppercase">Final Points</p>
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(res.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Publish Result Modal */}
      <Modal
        isOpen={isAddResultOpen}
        onClose={() => setIsAddResultOpen(false)}
        title="Publish Official Result"
        maxWidth="md"
      >
        <form onSubmit={handleSaveResult} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          <Select
            label="1. Select Competition"
            value={formEventId}
            onChange={(e) => {
              setFormEventId(e.target.value);
              const ev = events.find((ev) => ev.id === e.target.value);
              setFormRegId(ev?.registrations[0]?.id || "");
            }}
            required
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} - {e.name}
              </option>
            ))}
          </Select>

          <Select
            label="2. Select Registered Entry"
            value={formRegId}
            onChange={(e) => setFormRegId(e.target.value)}
            required
          >
            {currentFormEvent?.registrations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.registrationNumber} - {r.teamName || r.participants[0]?.participant?.name || "Participant"}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Rank / Position"
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);
                setIsWinner(e.target.value === "1");
              }}
            >
              <option value="1">1st Place (Winner)</option>
              <option value="2">2nd Place (Runner Up)</option>
              <option value="3">3rd Place (2nd Runner Up)</option>
              <option value="4">4th Place</option>
              <option value="5">5th Place</option>
            </Select>

            <Input
              label="Total Marks / Score"
              type="number"
              step="0.5"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              placeholder="e.g. 95.5"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isWinnerCheck"
              checked={isWinner}
              onChange={(e) => setIsWinner(e.target.checked)}
              className="rounded border-[#383334] text-[#931827] focus:ring-[#931827]"
            />
            <label htmlFor="isWinnerCheck" className="text-xs text-zinc-300">
              Flag as Winner (highlight on public leaderboard)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292526]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddResultOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              Publish Result
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
