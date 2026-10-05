"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  PlusCircle,
  Mail,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  createJudge,
  assignJudgeToEvent,
  removeJudgeAssignment,
} from "@/actions/judges";

export interface JudgeItem {
  id: string;
  userId: string;
  designation: string | null;
  organization: string | null;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  assignments: {
    id: string;
    eventId: string;
    event: {
      id: string;
      code: string;
      name: string;
      category: string | null;
    };
  }[];
  scores: { id: string }[];
}

export function JudgeManagementClient({
  judges,
  events = [],
}: {
  judges: JudgeItem[];
  events: { id: string; name: string; code: string }[];
}) {
  const router = useRouter();

  const [isAddJudgeOpen, setIsAddJudgeOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<JudgeItem | null>(null);

  // Add Judge Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [organization, setOrganization] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAddJudge(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await createJudge({
        name,
        email,
        phone,
        designation,
        organization,
      });

      if (!res.success) {
        setError(res.error || "Failed to add judge");
      } else {
        setIsAddJudgeOpen(false);
        setName("");
        setEmail("");
        setPhone("");
        setDesignation("");
        setOrganization("");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!assignTarget || !selectedEventId) return;

    setLoading(true);
    try {
      await assignJudgeToEvent(assignTarget.id, selectedEventId);
      setAssignTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveEvent(judgeId: string, eventId: string) {
    try {
      await removeJudgeAssignment(judgeId, eventId);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Jury & Evaluation Panel
          </h2>
          <p className="text-xs text-zinc-500">
            {judges.length} judges registered across competitions
          </p>
        </div>
        <Button
          onClick={() => setIsAddJudgeOpen(true)}
          size="sm"
          className="gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Judge</span>
        </Button>
      </div>

      {judges.length === 0 ? (
        <EmptyState
          icon={<Award className="w-6 h-6 text-zinc-500" />}
          title="No judges configured"
          description="Add industry experts, alumni, and faculty to evaluate festival competitions."
          actionLabel="Add Judge"
          onAction={() => setIsAddJudgeOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {judges.map((j) => (
            <Card key={j.id} className="space-y-4">
              <CardHeader className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{j.user.name}</CardTitle>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-zinc-500" />
                      <span>
                        {j.designation || "Jury Member"}{" "}
                        {j.organization ? `• ${j.organization}` : ""}
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setAssignTarget(j);
                      setSelectedEventId(events[0]?.id || "");
                    }}
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                    Assign Event
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <div className="text-xs text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-zinc-500" />
                    <span>{j.user.email}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#232021]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Assigned Events ({j.assignments.length})
                  </p>

                  {j.assignments.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-1">
                      No competitions assigned yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {j.assignments.map((asg) => (
                        <div
                          key={asg.id}
                          className="flex items-center gap-1.5 rounded-lg border border-[#383334] bg-[#1a1819] px-2.5 py-1 text-xs text-white"
                        >
                          <Badge variant="primary" className="text-[10px]">
                            {asg.event.code}
                          </Badge>
                          <span>{asg.event.name}</span>
                          <button
                            onClick={() =>
                              handleRemoveEvent(j.id, asg.event.id)
                            }
                            className="text-zinc-500 hover:text-red-400 ml-1"
                            title="Unassign"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Judge Modal */}
      <Modal
        isOpen={isAddJudgeOpen}
        onClose={() => setIsAddJudgeOpen(false)}
        title="Add Judge / Jury Member"
        maxWidth="md"
      >
        <form onSubmit={handleAddJudge} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          <Input
            label="Judge Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Sarah Jenkins"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="judge@domain.com"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555-0144"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Designation / Title"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Lead Choreographer, Tech Director"
            />
            <Input
              label="Organization / Company"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Google, Stanford, Studio X"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292526]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddJudgeOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              Add Judge
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Event Modal */}
      <Modal
        isOpen={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        title={`Assign Competition to ${assignTarget?.user.name}`}
        maxWidth="sm"
      >
        <form onSubmit={handleAssignEvent} className="space-y-4">
          <Select
            label="Select Event"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            required
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} - {e.name}
              </option>
            ))}
          </Select>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292526]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAssignTarget(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              Assign Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
