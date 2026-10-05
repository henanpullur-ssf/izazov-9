"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  PlusCircle,
  Pin,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePublishAnnouncement,
} from "@/actions/announcements";
import { formatDate, ANNOUNCEMENT_PRIORITIES } from "@/lib/constants";
import { AnnouncementPriority } from "@prisma/client";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  isPublished: boolean;
  isPinned: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

export function AnnouncementsManagementClient({
  announcements,
}: {
  announcements: AnnouncementItem[];
}) {
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AnnouncementItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementItem | null>(
    null
  );

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>(
    AnnouncementPriority.NORMAL
  );
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setTitle("");
    setContent("");
    setPriority(AnnouncementPriority.NORMAL);
    setIsPinned(false);
    setIsPublished(true);
    setError("");
    setIsCreateOpen(true);
  }

  function openEdit(a: AnnouncementItem) {
    setEditTarget(a);
    setTitle(a.title);
    setContent(a.content);
    setPriority(a.priority);
    setIsPinned(a.isPinned);
    setIsPublished(a.isPublished);
    setError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title,
      content,
      priority,
      isPinned,
      isPublished,
    };

    try {
      if (editTarget) {
        const res = await updateAnnouncement(editTarget.id, payload);
        if (!res.success) {
          setError(res.error || "Failed to update announcement");
        } else {
          setEditTarget(null);
          router.refresh();
        }
      } else {
        const res = await createAnnouncement(payload);
        if (!res.success) {
          setError(res.error || "Failed to create announcement");
        } else {
          setIsCreateOpen(false);
          router.refresh();
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePublish(id: string) {
    try {
      await togglePublishAnnouncement(id);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await deleteAnnouncement(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Festival Bulletins & Alerts
          </h2>
          <p className="text-xs text-zinc-500">
            {announcements.length} notices broadcasted to public portal
          </p>
        </div>

        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <PlusCircle className="w-4 h-4" />
          <span>New Announcement</span>
        </Button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="w-6 h-6 text-zinc-500" />}
          title="No announcements published"
          description="Broadcast schedule changes, gate openings, result notifications, and guest arrivals."
          actionLabel="Publish Announcement"
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card
              key={a.id}
              className={`p-4 sm:p-5 transition ${
                a.isPinned ? "border-amber-500/40 bg-[#161411]" : "hover:border-[#383334]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded-full">
                        <Pin className="w-3 h-3" /> PINNED
                      </span>
                    )}
                    <StatusBadge status={a.priority} />
                    {!a.isPublished && (
                      <Badge variant="neutral" className="text-[10px]">
                        Draft / Hidden
                      </Badge>
                    )}
                    <span className="text-[11px] text-zinc-500">
                      {formatDate(a.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {a.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {a.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#242122]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(a.id)}
                    title={a.isPublished ? "Unpublish notice" : "Publish notice"}
                  >
                    {a.isPublished ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-zinc-500 mr-1" />
                    )}
                    <span className="hidden sm:inline">
                      {a.isPublished ? "Published" : "Draft"}
                    </span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEdit(a)}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(a)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || Boolean(editTarget)}
        onClose={() => {
          setIsCreateOpen(false);
          setEditTarget(null);
        }}
        title={editTarget ? "Edit Announcement" : "Create Announcement"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          <Input
            label="Announcement Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. CodePulse Hackathon Round 2 Commencing"
            required
          />

          <Textarea
            label="Announcement Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write clear instructions, updates, or alerts..."
            rows={4}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority Level"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as AnnouncementPriority)
              }
            >
              {ANNOUNCEMENT_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </Select>

            <div className="space-y-2 pt-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinnedCheck"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-[#383334] text-[#931827] focus:ring-[#931827]"
                />
                <label htmlFor="isPinnedCheck" className="text-xs text-zinc-300">
                  Pin to top of feed
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublishedCheck"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-[#383334] text-[#931827] focus:ring-[#931827]"
                />
                <label htmlFor="isPublishedCheck" className="text-xs text-zinc-300">
                  Publish immediately to public portal
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292526]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreateOpen(false);
                setEditTarget(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={loading}>
              {editTarget ? "Update Announcement" : "Publish Announcement"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete Notice"
        isLoading={loading}
      />
    </div>
  );
}
