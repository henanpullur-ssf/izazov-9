"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  PlusCircle,
  Edit,
  Trash2,
  Calendar,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
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
  CategoryData,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  reorderCategories,
} from "@/actions/categories";

const COLOR_PRESETS = [
  { name: "Brand Red", hex: "#931827" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Orange", hex: "#f97316" },
  { name: "Rose", hex: "#f43f5e" },
];

export function CategoryManagementClient({
  categories,
}: {
  categories: CategoryData[];
}) {
  const router = useRouter();

  // Dialog & Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryData | null>(null);
  const [deleteWarningTarget, setDeleteWarningTarget] =
    useState<CategoryData | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#931827");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reordering, setReordering] = useState(false);

  function openCreate() {
    setName("");
    setDescription("");
    setColor("#931827");
    const nextOrder =
      categories.length > 0
        ? Math.max(...categories.map((c) => c.sortOrder || 0)) + 1
        : 1;
    setSortOrder(nextOrder.toString());
    setIsActive(true);
    setError("");
    setIsCreateOpen(true);
  }

  function openEdit(cat: CategoryData) {
    setEditTarget(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setColor(cat.color || "#931827");
    setSortOrder((cat.sortOrder || 0).toString());
    setIsActive(cat.isActive);
    setError("");
  }

  function handleDeleteClick(cat: CategoryData) {
    if ((cat.eventCount || 0) > 0) {
      setDeleteWarningTarget(cat);
    } else {
      setDeleteTarget(cat);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name,
      description,
      color,
      sortOrder: sortOrder ? parseInt(sortOrder, 10) : undefined,
      isActive,
    };

    try {
      if (editTarget) {
        const res = await updateCategory(editTarget.id, payload);
        if (!res.success) {
          setError(res.error || "Failed to update category");
        } else {
          setEditTarget(null);
          router.refresh();
        }
      } else {
        const res = await createCategory(payload);
        if (!res.success) {
          setError(res.error || "Failed to create category");
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

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await deleteCategory(deleteTarget.id);
      if (!res.success) {
        setError(res.error || "Failed to delete category");
      } else {
        setDeleteTarget(null);
        router.refresh();
      }
    } catch {
      setError("Failed to delete category");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(cat: CategoryData) {
    try {
      await toggleCategoryActive(cat.id, !cat.isActive);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMoveOrder(index: number, direction: "up" | "down") {
    if (reordering) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    setReordering(true);
    try {
      const newItems = [...categories];
      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;

      const orderedIds = newItems.map((c) => c.id);
      await reorderCategories(orderedIds);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setReordering(false);
    }
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        search === "" ||
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        (cat.description &&
          cat.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && cat.isActive) ||
        (statusFilter === "INACTIVE" && !cat.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const activeCount = categories.filter((c) => c.isActive).length;
  const totalEventCount = categories.reduce(
    (acc, curr) => acc + (curr.eventCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-xs font-medium text-zinc-400">Total Categories</p>
          <p className="text-xl font-bold text-white font-mono">
            {categories.length}
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs font-medium text-zinc-400">Active Categories</p>
          <p className="text-xl font-bold text-emerald-400 font-mono">
            {activeCount}
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs font-medium text-zinc-400">Inactive Categories</p>
          <p className="text-xl font-bold text-zinc-400 font-mono">
            {categories.length - activeCount}
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs font-medium text-zinc-400">Categorized Events</p>
          <p className="text-xl font-bold text-[#931827] font-mono">
            {totalEventCount}
          </p>
        </Card>
      </div>

      {/* Action and Filter Controls */}
      <div className="p-4 rounded-2xl border border-[#2d292a] bg-[#121112] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category by name or description..."
              className="w-full rounded-xl border border-[#332f30] bg-[#0c0b0c] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#931827]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
            }
            aria-label="Filter by Status"
            className="rounded-xl border border-[#332f30] bg-[#181617] px-3.5 py-2 text-xs text-zinc-300 outline-none focus:border-[#931827] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        <Button onClick={openCreate} size="sm" className="gap-1.5 whitespace-nowrap">
          <PlusCircle className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Categories Content */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          icon={<Tag className="w-6 h-6 text-zinc-500" />}
          title="No categories found"
          description={
            search || statusFilter !== "ALL"
              ? "Try adjusting your search query or status filter."
              : "Get started by adding your first event category."
          }
          actionLabel="Add Category"
          onAction={openCreate}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader className="w-16">Order</TableHeader>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Description</TableHeader>
                    <TableHeader>Events</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader className="text-right">Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.map((cat) => {
                    const originalIndex = categories.findIndex(
                      (c) => c.id === cat.id
                    );

                    return (
                      <TableRow key={cat.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-zinc-400 font-bold w-5">
                              {cat.sortOrder}
                            </span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => handleMoveOrder(originalIndex, "up")}
                                disabled={originalIndex === 0 || reordering}
                                className="text-zinc-500 hover:text-white disabled:opacity-20 p-0.5"
                                title="Move up"
                                aria-label="Move category up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  handleMoveOrder(originalIndex, "down")
                                }
                                disabled={
                                  originalIndex === categories.length - 1 ||
                                  reordering
                                }
                                className="text-zinc-500 hover:text-white disabled:opacity-20 p-0.5"
                                title="Move down"
                                aria-label="Move category down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                              style={{
                                backgroundColor: cat.color || "#931827",
                              }}
                            />
                            <span className="font-semibold text-white text-sm">
                              {cat.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-zinc-400 line-clamp-1 max-w-md">
                            {cat.description || "—"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{cat.eventCount || 0} events</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleActive(cat)}
                            className="group flex items-center gap-1.5 cursor-pointer"
                            title="Click to toggle status"
                          >
                            {cat.isActive ? (
                              <Badge variant="success" className="text-[10px] group-hover:opacity-80">
                                <CheckCircle2 className="w-3 h-3 mr-0.5" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="neutral" className="text-[10px] group-hover:opacity-80">
                                <XCircle className="w-3 h-3 mr-0.5" />
                                Inactive
                              </Badge>
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openEdit(cat)}
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteClick(cat)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredCategories.map((cat) => {
              const originalIndex = categories.findIndex(
                (c) => c.id === cat.id
              );

              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl border border-[#2d292a] bg-[#141314] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || "#931827" }}
                      />
                      <h3 className="font-semibold text-white text-base">
                        {cat.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className="cursor-pointer"
                    >
                      {cat.isActive ? (
                        <Badge variant="success" className="text-[10px]">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="neutral" className="text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </button>
                  </div>

                  {cat.description && (
                    <p className="text-xs text-zinc-400">{cat.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[#232021] text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-zinc-500">Order:</span>
                      <span className="font-mono font-bold text-white">
                        {cat.sortOrder}
                      </span>
                      <div className="flex items-center ml-1">
                        <button
                          onClick={() => handleMoveOrder(originalIndex, "up")}
                          disabled={originalIndex === 0 || reordering}
                          className="text-zinc-500 hover:text-white disabled:opacity-20 p-1"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() =>
                            handleMoveOrder(originalIndex, "down")
                          }
                          disabled={
                            originalIndex === categories.length - 1 ||
                            reordering
                          }
                          className="text-zinc-500 hover:text-white disabled:opacity-20 p-1"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{cat.eventCount || 0} events</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232021]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEdit(cat)}
                      className="flex-1"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(cat)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || Boolean(editTarget)}
        onClose={() => {
          setIsCreateOpen(false);
          setEditTarget(null);
        }}
        title={editTarget ? "Edit Event Category" : "Add Event Category"}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          <Input
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Technical, Cultural, Gaming & Esports"
            required
            helperText="Display name for this category across the website"
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief explanation of competitions and disciplines included in this category..."
            rows={3}
          />

          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Category Color Accent
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-label="Color Picker"
                className="w-10 h-10 rounded-xl border border-[#383334] bg-[#0d0c0d] p-0.5 cursor-pointer"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#931827"
                className="font-mono text-xs"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {COLOR_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.hex}
                  onClick={() => setColor(preset.hex)}
                  className={`w-6 h-6 rounded-full border transition cursor-pointer ${
                    color.toLowerCase() === preset.hex.toLowerCase()
                      ? "border-white scale-110 shadow-sm"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Sort Order"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="1"
              helperText="Determines listing order in tabs & dropdowns"
            />

            <div className="space-y-2 flex flex-col justify-center pt-2">
              <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Active Status
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="categoryIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-[#383334] text-[#931827] focus:ring-[#931827]"
                />
                <label
                  htmlFor="categoryIsActive"
                  className="text-xs text-zinc-300 cursor-pointer"
                >
                  Active & visible in event forms
                </label>
              </div>
            </div>
          </div>

          {editTarget && (editTarget.eventCount || 0) > 0 && (
            <div className="p-3 rounded-xl bg-[#1f1b1c] border border-[#3d3738] text-xs text-zinc-300">
              <span className="font-semibold text-white">Note:</span> Renaming
              this category will automatically update all {editTarget.eventCount}{" "}
              associated event(s).
            </div>
          )}

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
              {editTarget ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Safe Delete Dialog (No Events Assigned) */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete Category"
        isLoading={loading}
      />

      {/* In-use Warning Modal (Events Assigned) */}
      <Modal
        isOpen={Boolean(deleteWarningTarget)}
        onClose={() => setDeleteWarningTarget(null)}
        title="Category Currently In Use"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-800/60 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-white">
                Cannot Delete Category &quot;{deleteWarningTarget?.name}&quot;
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                This category is currently assigned to{" "}
                <strong className="text-white font-mono">
                  {deleteWarningTarget?.eventCount}
                </strong>{" "}
                event(s). Deleting it would break existing event records, scoring,
                and leaderboard filters.
              </p>
              <p className="text-xs text-zinc-400">
                To prevent new events from selecting this category while
                preserving existing data, you can{" "}
                <strong className="text-amber-300">deactivate</strong> it instead.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#292526]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteWarningTarget(null)}
            >
              Close
            </Button>
            {deleteWarningTarget?.isActive && (
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  if (deleteWarningTarget) {
                    await handleToggleActive(deleteWarningTarget);
                    setDeleteWarningTarget(null);
                  }
                }}
              >
                Deactivate Category Instead
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
