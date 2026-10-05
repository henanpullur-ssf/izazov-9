"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createParticipant, updateParticipant } from "@/actions/participants";

export interface HouseOption {
  id: string;
  name: string;
}

export function ParticipantForm({
  initialData,
  houses = [],
  isEdit = false,
}: {
  initialData?: {
    id?: string;
    participantId?: string;
    name?: string;
    gender?: string | null;
    dateOfBirth?: Date | string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    houseId?: string | null;
  };
  houses: HouseOption[];
  isEdit?: boolean;
}) {
  const router = useRouter();

  const [participantId, setParticipantId] = useState(
    initialData?.participantId || ""
  );
  const [name, setName] = useState(initialData?.name || "");
  const [gender, setGender] = useState(initialData?.gender || "Male");
  const [dateOfBirth, setDateOfBirth] = useState(
    initialData?.dateOfBirth
      ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
      : ""
  );
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [houseId, setHouseId] = useState(initialData?.houseId || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const payload = {
      participantId,
      name,
      gender,
      dateOfBirth: dateOfBirth || undefined,
      phone,
      email,
      address,
      houseId: houseId || undefined,
    };

    try {
      if (isEdit && initialData?.id) {
        const res = await updateParticipant(initialData.id, payload);
        if (!res.success) {
          setError(res.error || "Failed to update participant");
        } else {
          setSuccess("Participant updated successfully!");
          router.push(`/admin/participants/${initialData.id}`);
          router.refresh();
        }
      } else {
        const res = await createParticipant(payload);
        if (!res.success) {
          setError(res.error || "Failed to create participant");
        } else {
          setSuccess("Participant created successfully!");
          router.push("/admin/participants");
          router.refresh();
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Participant ID / Roll No."
          value={participantId}
          onChange={(e) => setParticipantId(e.target.value)}
          placeholder="e.g. IZ-2026-001 or University Roll"
          required
          disabled={isEdit}
          helperText="Unique identifier for pass generation"
        />

        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex Johnson"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </Select>

        <Input
          label="Date of Birth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />

        <Select
          label="House / Team"
          value={houseId}
          onChange={(e) => setHouseId(e.target.value)}
        >
          <option value="">No House Assigned</option>
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="participant@campus.edu"
        />

        <Input
          label="Phone / Mobile Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555-0199"
        />
      </div>

      <Textarea
        label="Department / Hostel / Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="e.g. Computer Science Dept, Block B..."
        rows={2}
      />

      <div className="flex items-center gap-3 pt-4 border-t border-[#292526]">
        <Button type="submit" isLoading={loading}>
          {isEdit ? "Update Participant" : "Add Participant"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
