"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  LayoutTemplate,
  Info,
  Phone,
  Compass,
  Shield,
  Save,
  RotateCcw,
  Sparkles,
  PlusCircle,
  Trash2,
  Database,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  updateSiteSettings,
  resetSiteSettings,
  createHouse,
  deleteHouse,
  updateUserRole,
  seedInitialData,
} from "@/actions/settings";
import {
  USER_ROLES,
  UserRole,
  SiteSettingsData,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/constants";

export interface HouseItem {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  _count?: {
    participants: number;
  };
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
}

export function SettingsManagementClient({
  initialSettings,
  houses = [],
  users = [],
}: {
  initialSettings: SiteSettingsData;
  houses: HouseItem[];
  users: UserItem[];
}) {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "brand_theme" | "homepage" | "about_fest" | "contact_social" | "nav_footer_seo" | "houses_roles"
  >("brand_theme");

  // Site Settings Form State
  const [formData, setFormData] = useState<SiteSettingsData>(initialSettings || DEFAULT_SITE_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // House System State
  const [isCreateHouseOpen, setIsCreateHouseOpen] = useState(false);
  const [houseName, setHouseName] = useState("");
  const [houseShortName, setHouseShortName] = useState("");
  const [houseDescription, setHouseDescription] = useState("");
  const [houseLoading, setHouseLoading] = useState(false);
  const [houseError, setHouseError] = useState("");
  const [deleteHouseTarget, setDeleteHouseTarget] = useState<HouseItem | null>(null);

  // User Role State
  const [roleUserTarget, setRoleUserTarget] = useState<UserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("PARTICIPANT");
  const [roleLoading, setRoleLoading] = useState(false);

  // Seeder State
  const [seedLoading, setSeedLoading] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  function handleInputChange<K extends keyof SiteSettingsData>(
    field: K,
    value: SiteSettingsData[K]
  ) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function showToast(type: "success" | "error", text: string) {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateSiteSettings(formData);
      if (res.success && res.data) {
        setFormData(res.data);
        showToast("success", "✓ Website customizations saved successfully!");
        router.refresh();
      } else {
        showToast("error", res.error || "✕ Failed to save customizations");
      }
    } catch {
      showToast("error", "✕ An unexpected error occurred while saving");
    } finally {
      setSaving(false);
    }
  }

  function handleResetForm() {
    setFormData(initialSettings || DEFAULT_SITE_SETTINGS);
    showToast("success", "Restored unsaved changes to active settings.");
  }

  async function handleResetToDefaults() {
    setSaving(true);
    try {
      const res = await resetSiteSettings();
      if (res.success && res.data) {
        setFormData(res.data);
        setIsResetConfirmOpen(false);
        showToast("success", "✓ Reset all website settings to IZAZOV defaults!");
        router.refresh();
      } else {
        showToast("error", res.error || "✕ Failed to reset settings");
      }
    } catch {
      showToast("error", "✕ Failed to reset settings");
    } finally {
      setSaving(false);
    }
  }

  function handleResetThemeOnly() {
    setFormData((prev) => ({
      ...prev,
      primaryColor: DEFAULT_SITE_SETTINGS.primaryColor,
      backgroundColor: DEFAULT_SITE_SETTINGS.backgroundColor,
      surfaceColor: DEFAULT_SITE_SETTINGS.surfaceColor,
      cardColor: DEFAULT_SITE_SETTINGS.cardColor,
      textColor: DEFAULT_SITE_SETTINGS.textColor,
      mutedTextColor: DEFAULT_SITE_SETTINGS.mutedTextColor,
      borderColor: DEFAULT_SITE_SETTINGS.borderColor,
    }));
    showToast("success", "Theme colors reset to default IZAZOV Crimson & Charcoal.");
  }

  // House Actions
  async function handleCreateHouse(e: React.FormEvent) {
    e.preventDefault();
    setHouseLoading(true);
    setHouseError("");
    try {
      const res = await createHouse({
        name: houseName,
        shortName: houseShortName || undefined,
        description: houseDescription || undefined,
      });
      if (res.success) {
        setIsCreateHouseOpen(false);
        setHouseName("");
        setHouseShortName("");
        setHouseDescription("");
        showToast("success", "House created successfully!");
        router.refresh();
      } else {
        setHouseError(res.error || "Failed to create house");
      }
    } catch {
      setHouseError("Failed to create house");
    } finally {
      setHouseLoading(false);
    }
  }

  async function handleDeleteHouse() {
    if (!deleteHouseTarget) return;
    setHouseLoading(true);
    try {
      await deleteHouse(deleteHouseTarget.id);
      setDeleteHouseTarget(null);
      showToast("success", "House deleted successfully!");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setHouseLoading(false);
    }
  }

  // User Role Update
  async function handleUpdateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!roleUserTarget) return;
    setRoleLoading(true);
    try {
      const res = await updateUserRole(roleUserTarget.id, selectedRole);
      if (res.success) {
        setRoleUserTarget(null);
        showToast("success", "User role updated successfully!");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRoleLoading(false);
    }
  }

  // Seed Initial Demo Data
  async function handleSeedData() {
    setSeedLoading(true);
    try {
      const res = await seedInitialData();
      if (res.success) {
        showToast("success", "Demo data seeded successfully!");
        router.refresh();
      } else {
        showToast("error", res.error || "Failed to seed demo data");
      }
    } catch {
      showToast("error", "Failed to seed demo data");
    } finally {
      setSeedLoading(false);
    }
  }

  const tabs = [
    { id: "brand_theme", label: "Branding & Theme", icon: Palette },
    { id: "homepage", label: "Homepage & Sections", icon: LayoutTemplate },
    { id: "about_fest", label: "About & Fest Info", icon: Info },
    { id: "contact_social", label: "Contact & Social", icon: Phone },
    { id: "nav_footer_seo", label: "Navigation, Footer & SEO", icon: Compass },
    { id: "houses_roles", label: "Houses & Roles", icon: Shield },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-medium transition animate-in slide-in-from-bottom-5 ${
            toastMessage.type === "success"
              ? "bg-[#142316] text-emerald-300 border-emerald-800/60"
              : "bg-[#291214] text-red-300 border-red-800/60"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#121112] border border-[#262223]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#931827] flex items-center justify-center text-white shadow-md shadow-[#931827]/30 border border-red-400/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Website Customization & Control Panel
            </h2>
            <p className="text-xs text-zinc-400">
              Live adjustments persist to database and revalidate public portal immediately.
            </p>
          </div>
        </div>

        {activeTab !== "houses_roles" && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetForm}
              disabled={saving}
              className="gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Changes</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsResetConfirmOpen(true)}
              disabled={saving}
              className="gap-1.5 text-xs text-zinc-300"
            >
              <span>Reset to Defaults</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveSettings}
              disabled={saving}
              className="gap-1.5 shadow-lg shadow-[#931827]/25"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Customizations"}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#242122] scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                active
                  ? "bg-[#931827] text-white shadow-md shadow-[#931827]/20"
                  : "text-zinc-400 hover:text-white hover:bg-[#181617]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left Controls (60%) | Right Live Preview (40%) */}
      {activeTab !== "houses_roles" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Form Column */}
          <form onSubmit={handleSaveSettings} className="lg:col-span-7 space-y-6">
            {/* TAB 1: BRANDING & THEME */}
            {activeTab === "brand_theme" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Brand Identity Card */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#242122] pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#931827]" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Brand Identity
                      </h3>
                    </div>
                    <Badge variant="neutral">Portal Branding</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Site Name / Fest Name"
                      value={formData.siteName}
                      onChange={(e) => handleInputChange("siteName", e.target.value)}
                      placeholder="IZAZOV 9.0"
                      required
                    />
                    <Input
                      label="Short Name / Monogram"
                      value={formData.shortName}
                      onChange={(e) => handleInputChange("shortName", e.target.value)}
                      placeholder="IZAZOV"
                      required
                    />
                  </div>

                  <Input
                    label="Official Tagline / Slogan"
                    value={formData.tagline}
                    onChange={(e) => handleInputChange("tagline", e.target.value)}
                    placeholder="Where Talent Meets Glory"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <Input
                      label="Logo Image URL (Optional)"
                      value={formData.logoUrl || ""}
                      onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                      placeholder="https://... or /logo.png"
                      helperText="Leave empty to use the high-contrast monogram badge."
                    />
                    <Input
                      label="Favicon URL (Optional)"
                      value={formData.faviconUrl || ""}
                      onChange={(e) => handleInputChange("faviconUrl", e.target.value)}
                      placeholder="https://... or /favicon.ico"
                    />
                  </div>
                </Card>

                {/* Theme & Color Palette Card */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#242122] pb-3">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-[#931827]" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Color Theme Palette
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResetThemeOnly}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Reset Colors
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary Brand Color */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#0e0d0e] border border-[#282425]">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                        <span>Primary Brand Accent</span>
                        <span className="text-[11px] font-mono text-zinc-400">{formData.primaryColor}</span>
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                          placeholder="#931827"
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#0e0d0e] border border-[#282425]">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                        <span>Canvas Background</span>
                        <span className="text-[11px] font-mono text-zinc-400">{formData.backgroundColor}</span>
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={formData.backgroundColor}
                          onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <Input
                          value={formData.backgroundColor}
                          onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
                          placeholder="#000000"
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Surface Color */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#0e0d0e] border border-[#282425]">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                        <span>Surface / Header Color</span>
                        <span className="text-[11px] font-mono text-zinc-400">{formData.surfaceColor}</span>
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={formData.surfaceColor}
                          onChange={(e) => handleInputChange("surfaceColor", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <Input
                          value={formData.surfaceColor}
                          onChange={(e) => handleInputChange("surfaceColor", e.target.value)}
                          placeholder="#231F20"
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Card Color */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#0e0d0e] border border-[#282425]">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                        <span>Card Container Color</span>
                        <span className="text-[11px] font-mono text-zinc-400">{formData.cardColor}</span>
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={formData.cardColor}
                          onChange={(e) => handleInputChange("cardColor", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <Input
                          value={formData.cardColor}
                          onChange={(e) => handleInputChange("cardColor", e.target.value)}
                          placeholder="#111011"
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Text Color */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#0e0d0e] border border-[#282425]">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                        <span>Headings & Text Color</span>
                        <span className="text-[11px] font-mono text-zinc-400">{formData.textColor}</span>
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={formData.textColor}
                          onChange={(e) => handleInputChange("textColor", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <Input
                          value={formData.textColor}
                          onChange={(e) => handleInputChange("textColor", e.target.value)}
                          placeholder="#FFFFFF"
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Muted Text Color */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#0e0d0e] border border-[#282425]">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                        <span>Subtext & Muted Color</span>
                        <span className="text-[11px] font-mono text-zinc-400">{formData.mutedTextColor}</span>
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={formData.mutedTextColor}
                          onChange={(e) => handleInputChange("mutedTextColor", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <Input
                          value={formData.mutedTextColor}
                          onChange={(e) => handleInputChange("mutedTextColor", e.target.value)}
                          placeholder="#B8B8B8"
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Border Color */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#0e0d0e] border border-[#282425] sm:col-span-2">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                        <span>Subtle Borders Color</span>
                        <span className="text-[11px] font-mono text-zinc-400">{formData.borderColor}</span>
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={formData.borderColor}
                          onChange={(e) => handleInputChange("borderColor", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <Input
                          value={formData.borderColor}
                          onChange={(e) => handleInputChange("borderColor", e.target.value)}
                          placeholder="#2D292A"
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* TAB 2: HOMEPAGE CONTENT & SECTIONS */}
            {activeTab === "homepage" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Hero Section Banner Card */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#242122] pb-3">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4 text-[#931827]" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Hero Banner Content
                      </h3>
                    </div>
                    <Badge variant="neutral">Landing View</Badge>
                  </div>

                  <Input
                    label="Hero Main Headline"
                    value={formData.heroTitle}
                    onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                    placeholder="IGNITE THE ARENA"
                    required
                  />

                  <Input
                    label="Hero Subtitle / Tagline Pill"
                    value={formData.heroSubtitle}
                    onChange={(e) => handleInputChange("heroSubtitle", e.target.value)}
                    placeholder="THE 9TH EDITION • MARCH 2026"
                    required
                  />

                  <Textarea
                    label="Hero Summary Description"
                    value={formData.heroDescription}
                    onChange={(e) => handleInputChange("heroDescription", e.target.value)}
                    rows={3}
                    placeholder="The flagship campus festival uniting cultural spectacles..."
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Primary Button Label"
                      value={formData.heroButtonText}
                      onChange={(e) => handleInputChange("heroButtonText", e.target.value)}
                      placeholder="Explore Events"
                      required
                    />
                    <Input
                      label="Primary Button Destination Link"
                      value={formData.heroButtonLink}
                      onChange={(e) => handleInputChange("heroButtonLink", e.target.value)}
                      placeholder="/events"
                      required
                    />
                  </div>

                  <Input
                    label="Hero Custom Background Image URL (Optional)"
                    value={formData.heroImageUrl || ""}
                    onChange={(e) => handleInputChange("heroImageUrl", e.target.value)}
                    placeholder="https://... (Leave empty for radial crimson glow)"
                  />
                </Card>

                {/* Homepage Section Visibility Toggles Card */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#242122] pb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#931827]" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Homepage Sections Visibility
                      </h3>
                    </div>
                    <span className="text-xs text-zinc-400">Toggle active modules</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        key: "showStats" as const,
                        label: "Live Metrics Strip",
                        desc: "Displays counts for registrations, events, participants, and days.",
                      },
                      {
                        key: "showFeaturedEvents" as const,
                        label: "Featured Upcoming Events Carousel",
                        desc: "Displays live/upcoming event cards on the home page.",
                      },
                      {
                        key: "showSchedule" as const,
                        label: "Schedule Timeline Preview",
                        desc: "Shows upcoming timetable slots directly on the landing page.",
                      },
                      {
                        key: "showAnnouncements" as const,
                        label: "Latest Bulletins & Announcements",
                        desc: "Highlights pinned and urgent festival notifications.",
                      },
                      {
                        key: "showResults" as const,
                        label: "Championship Standings & Podiums",
                        desc: "Shows live House scores and recent winners.",
                      },
                    ].map((section) => (
                      <div
                        key={section.key}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-[#0e0d0e] border border-[#262223]"
                      >
                        <div>
                          <p className="text-xs font-semibold text-white">{section.label}</p>
                          <p className="text-[11px] text-zinc-400">{section.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData[section.key]}
                          onChange={(e) => handleInputChange(section.key, e.target.checked)}
                          className="w-4 h-4 accent-[#931827] rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* TAB 3: ABOUT & FEST DETAILS */}
            {activeTab === "about_fest" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* About Page Content Card */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#242122] pb-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#931827]" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        About Page Content
                      </h3>
                    </div>
                    <Badge variant="neutral">/about</Badge>
                  </div>

                  <Input
                    label="About Page Title"
                    value={formData.aboutTitle}
                    onChange={(e) => handleInputChange("aboutTitle", e.target.value)}
                    placeholder="About IZAZOV 9.0"
                    required
                  />

                  <Textarea
                    label="Festival Overview & Lore"
                    value={formData.aboutDescription}
                    onChange={(e) => handleInputChange("aboutDescription", e.target.value)}
                    rows={4}
                    placeholder="Detailed history and vision of the campus festival..."
                    required
                  />

                  <Input
                    label="About Banner Image URL (Optional)"
                    value={formData.aboutImageUrl || ""}
                    onChange={(e) => handleInputChange("aboutImageUrl", e.target.value)}
                    placeholder="https://... or /about-hero.jpg"
                  />
                </Card>

                {/* Festival Details Card */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#242122] pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#931827]" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Festival Logistics & Schedule Dates
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Festival Name"
                      value={formData.festName}
                      onChange={(e) => handleInputChange("festName", e.target.value)}
                      placeholder="IZAZOV"
                      required
                    />
                    <Input
                      label="Edition Number"
                      value={formData.edition}
                      onChange={(e) => handleInputChange("edition", e.target.value)}
                      placeholder="9.0"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Festival Start Date Display"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      placeholder="MARCH 25, 2026"
                      required
                    />
                    <Input
                      label="Festival End Date Display"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      placeholder="MARCH 28, 2026"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Main Arena / Venue Name"
                      value={formData.venueName}
                      onChange={(e) => handleInputChange("venueName", e.target.value)}
                      placeholder="Main Campus Arena"
                      required
                    />
                    <Input
                      label="Campus Venue Location"
                      value={formData.venueLocation}
                      onChange={(e) => handleInputChange("venueLocation", e.target.value)}
                      placeholder="Block A & Central Amphitheatre"
                      required
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* TAB 4: CONTACT & SOCIAL MEDIA */}
            {activeTab === "contact_social" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Contact Information Card */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#242122] pb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#931827]" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Helpdesk & Contact Info
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Official Email Address"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                      placeholder="fest@izazov9.com"
                      required
                    />
                    <Input
                      label="Helpdesk Phone Number"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Official WhatsApp Support Number / Link"
                      value={formData.contactWhatsApp || ""}
                      onChange={(e) => handleInputChange("contactWhatsApp", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                    <Input
                      label="Campus Postal Address / Desk"
                      value={formData.contactAddress}
                      onChange={(e) => handleInputChange("contactAddress", e.target.value)}
                      placeholder="Main Campus Arena, University City"
                      required
                    />
                  </div>
                </Card>

                {/* Social Channels Card */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#242122] pb-3">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-[#931827]" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Social Media Channels
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Instagram URL"
                      value={formData.instagramUrl || ""}
                      onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
                      placeholder="https://instagram.com/izazovfest"
                    />
                    <Input
                      label="YouTube URL"
                      value={formData.youtubeUrl || ""}
                      onChange={(e) => handleInputChange("youtubeUrl", e.target.value)}
                      placeholder="https://youtube.com/@izazovfest"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Facebook URL"
                      value={formData.facebookUrl || ""}
                      onChange={(e) => handleInputChange("facebookUrl", e.target.value)}
                      placeholder="https://facebook.com/izazovfest"
                    />
                    <Input
                      label="Official Website URL"
                      value={formData.websiteUrl || ""}
                      onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                      placeholder="https://izazov9.com"
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* TAB 5: NAVIGATION, FOOTER & SEO */}
            {activeTab === "nav_footer_seo" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Navigation Visibility Card */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#242122] pb-3">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#931827]" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Public Navigation Visibility
                      </h3>
                    </div>
                    <span className="text-xs text-zinc-400">Header & Mobile links</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "showEvents" as const, label: "Competitions (/events)" },
                      { key: "showScheduleNav" as const, label: "Schedule (/schedule)" },
                      { key: "showResultsNav" as const, label: "Leaderboard (/results)" },
                      { key: "showAnnouncementsNav" as const, label: "Bulletins (/announcements)" },
                      { key: "showVenuesNav" as const, label: "Venues (/venues)" },
                      { key: "showAboutNav" as const, label: "About Page (/about)" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#0e0d0e] border border-[#262223]"
                      >
                        <span className="text-xs font-semibold text-white">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={formData[item.key]}
                          onChange={(e) => handleInputChange(item.key, e.target.checked)}
                          className="w-4 h-4 accent-[#931827] rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Footer Content Card */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#242122] pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Footer Text & Copyright
                    </h3>
                  </div>

                  <Textarea
                    label="Footer Brand Statement"
                    value={formData.footerText}
                    onChange={(e) => handleInputChange("footerText", e.target.value)}
                    rows={2}
                    placeholder="IZAZOV 9.0 is the official campus festival..."
                    required
                  />

                  <Input
                    label="Copyright Notice"
                    value={formData.copyrightText}
                    onChange={(e) => handleInputChange("copyrightText", e.target.value)}
                    placeholder="© 2026 IZAZOV 9.0 Fest Committee. All rights reserved."
                    required
                  />
                </Card>

                {/* SEO & Meta Card */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#242122] pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Search Engine Optimization & Social Sharing
                    </h3>
                  </div>

                  <Input
                    label="Default Meta Title"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                    placeholder="IZAZOV 9.0 — Campus Fest Operations & Management Platform"
                    required
                  />

                  <Textarea
                    label="Meta Description"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                    rows={3}
                    placeholder="Official festival management platform..."
                    required
                  />

                  <Input
                    label="OpenGraph / Twitter Social Share Image URL"
                    value={formData.ogImageUrl || ""}
                    onChange={(e) => handleInputChange("ogImageUrl", e.target.value)}
                    placeholder="https://.../og-banner.png"
                  />
                </Card>
              </div>
            )}

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForm}
                disabled={saving}
              >
                Discard Changes
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="gap-2 shadow-xl shadow-[#931827]/30"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Customizations..." : "Save Customizations"}</span>
              </Button>
            </div>
          </form>

          {/* Right Live Interactive Preview Column (50% on large screens) */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#931827]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Real-Time Portal Preview
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#181617] border border-[#2d292a] text-zinc-400">
                Interactive
              </span>
            </div>

            {/* Simulated Live Viewport Container */}
            <div
              className="rounded-3xl border border-[#2d292a] overflow-hidden shadow-2xl transition-all duration-300"
              style={{
                backgroundColor: formData.backgroundColor || "#000000",
                borderColor: formData.borderColor || "#2d292a",
                color: formData.textColor || "#ffffff",
              }}
            >
              {/* Mock Browser Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b text-[11px]"
                style={{
                  backgroundColor: formData.surfaceColor || "#231f20",
                  borderColor: formData.borderColor || "#2d292a",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-xs opacity-70 truncate max-w-[180px]">
                  {formData.siteName.toLowerCase().replace(/\s+/g, "")}.com
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-bold">
                  {formData.edition || "9.0"}
                </span>
              </div>

              {/* Mock Public Navbar */}
              <div
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{
                  backgroundColor: formData.surfaceColor || "#111011",
                  borderColor: formData.borderColor || "#2d292a",
                }}
              >
                <div className="flex items-center gap-2">
                  {formData.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formData.logoUrl}
                      alt="Logo"
                      className="w-6 h-6 object-contain rounded"
                    />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-white shadow-sm"
                      style={{ backgroundColor: formData.primaryColor || "#931827" }}
                    >
                      {formData.shortName.slice(0, 2).toUpperCase() || "IZ"}
                    </div>
                  )}
                  <span className="font-extrabold text-xs tracking-wide">
                    {formData.siteName || "IZAZOV 9.0"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] opacity-80">
                  {formData.showEvents && <span>Events</span>}
                  {formData.showScheduleNav && <span>Schedule</span>}
                  {formData.showResultsNav && <span>Results</span>}
                </div>
              </div>

              {/* Mock Hero Section */}
              <div
                className="p-6 text-center space-y-3 relative overflow-hidden"
                style={{
                  background: formData.heroImageUrl
                    ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url(${formData.heroImageUrl}) center/cover`
                    : `radial-gradient(ellipse at top, ${formData.primaryColor}33, transparent 70%)`,
                }}
              >
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border"
                  style={{
                    backgroundColor: `${formData.primaryColor}22`,
                    borderColor: `${formData.primaryColor}55`,
                    color: formData.primaryColor || "#931827",
                  }}
                >
                  <span>{formData.heroSubtitle || "THE 9TH EDITION"}</span>
                </div>

                <h3 className="text-xl font-black uppercase tracking-tight leading-tight">
                  {formData.heroTitle || "IGNITE THE ARENA"}
                </h3>

                <p
                  className="text-[11px] leading-relaxed max-w-xs mx-auto line-clamp-2"
                  style={{ color: formData.mutedTextColor || "#b8b8b8" }}
                >
                  {formData.heroDescription || "The flagship campus festival..."}
                </p>

                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-lg font-bold text-xs text-white shadow-md transition"
                    style={{ backgroundColor: formData.primaryColor || "#931827" }}
                  >
                    {formData.heroButtonText || "Explore Events"}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                    style={{
                      borderColor: formData.borderColor || "#2d292a",
                      backgroundColor: formData.cardColor || "#111011",
                      color: formData.textColor || "#ffffff",
                    }}
                  >
                    Schedule
                  </button>
                </div>
              </div>

              {/* Mock Sample Card */}
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                  Sample Component Rendering
                </p>
                <div
                  className="p-3.5 rounded-xl border space-y-2"
                  style={{
                    backgroundColor: formData.cardColor || "#111011",
                    borderColor: formData.borderColor || "#2d292a",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${formData.primaryColor}22`,
                        color: formData.primaryColor || "#931827",
                      }}
                    >
                      Technical Track
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: formData.mutedTextColor || "#b8b8b8" }}
                    >
                      {formData.venueName || "Main Arena"}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold">24-Hour CodePulse Hackathon</h4>
                  <p
                    className="text-[10px] leading-normal"
                    style={{ color: formData.mutedTextColor || "#b8b8b8" }}
                  >
                    {formData.tagline || "Where Talent Meets Glory"}
                  </p>
                </div>
              </div>

              {/* Mock Footer Strip */}
              <div
                className="px-4 py-3 border-t text-[10px] flex items-center justify-between"
                style={{
                  backgroundColor: formData.surfaceColor || "#111011",
                  borderColor: formData.borderColor || "#2d292a",
                  color: formData.mutedTextColor || "#b8b8b8",
                }}
              >
                <span className="truncate max-w-[180px]">{formData.copyrightText}</span>
                <span className="font-semibold text-white">{formData.contactEmail}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 6: HOUSES & PERMISSIONS */
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* House Management Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Festival Factions / Houses
                </h3>
                <p className="text-xs text-zinc-400">
                  Manage the 4 championship factions competing for the festival trophy.
                </p>
              </div>

              <Button onClick={() => setIsCreateHouseOpen(true)} size="sm" className="gap-1.5">
                <PlusCircle className="w-4 h-4" />
                <span>Create House</span>
              </Button>
            </div>

            {houses.length === 0 ? (
              <Card className="p-8 text-center space-y-3">
                <p className="text-sm text-zinc-400">No houses registered in database.</p>
                <Button onClick={handleSeedData} size="sm" variant="outline" className="gap-2">
                  <Database className="w-4 h-4" />
                  <span>Seed Default 4 Houses</span>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {houses.map((house) => (
                  <Card key={house.id} className="p-5 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-[#931827] flex items-center justify-center font-bold text-white text-xs">
                        {house.shortName || house.name.slice(0, 2).toUpperCase()}
                      </div>
                      <Badge variant="neutral">
                        {house._count?.participants || 0} Members
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white tracking-tight">
                        {house.name}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {house.description || "No description provided."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#232021] flex justify-end">
                      <button
                        onClick={() => setDeleteHouseTarget(house)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition cursor-pointer"
                        title="Delete House"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* User Role Access Control */}
          <div className="space-y-4 pt-6 border-t border-[#232021]">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                User Access & Permissions
              </h3>
              <p className="text-xs text-zinc-400">
                Grant elevated coordinator, volunteer, judge, or admin capabilities to registered campus accounts.
              </p>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181617] border-b border-[#2d292a] text-zinc-400 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Current Role</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232021]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#161415] transition">
                        <td className="px-4 py-3 font-semibold text-white">{u.name}</td>
                        <td className="px-4 py-3 text-zinc-400 font-mono text-[11px]">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              u.role === "SUPER_ADMIN"
                                ? "danger"
                                : u.role === "ADMIN"
                                ? "primary"
                                : u.role === "COORDINATOR"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRoleUserTarget(u);
                              setSelectedRole(u.role);
                            }}
                            className="text-xs text-zinc-300 hover:text-white"
                          >
                            Change Role
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Demo Data Seeder Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#170e10] to-[#121112] border border-[#3b171c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-[#931827]" />
                <span>Initialize Demonstration Datasets</span>
              </h4>
              <p className="text-xs text-zinc-400 max-w-xl">
                Populates default venues, sample competitions, preliminary schedules, and announcements if database tables are unpopulated.
              </p>
            </div>
            <Button
              onClick={handleSeedData}
              disabled={seedLoading}
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
            >
              <Database className="w-4 h-4" />
              <span>{seedLoading ? "Seeding..." : "Seed Demo Data"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Create House */}
      <Modal
        isOpen={isCreateHouseOpen}
        onClose={() => setIsCreateHouseOpen(false)}
        title="Create Championship House"
      >
        <form onSubmit={handleCreateHouse} className="space-y-4">
          {houseError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
              {houseError}
            </div>
          )}

          <Input
            label="House Name"
            value={houseName}
            onChange={(e) => setHouseName(e.target.value)}
            placeholder="e.g. Phoenix, Pegasus, Orion, Hydra"
            required
          />

          <Input
            label="Short Name / Monogram"
            value={houseShortName}
            onChange={(e) => setHouseShortName(e.target.value)}
            placeholder="e.g. PHX"
          />

          <Textarea
            label="Description & Motto"
            value={houseDescription}
            onChange={(e) => setHouseDescription(e.target.value)}
            placeholder="House of Flames & Innovation..."
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#232021]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateHouseOpen(false)}
              disabled={houseLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={houseLoading}>
              {houseLoading ? "Creating..." : "Create House"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Change User Role */}
      <Modal
        isOpen={!!roleUserTarget}
        onClose={() => setRoleUserTarget(null)}
        title={`Change Role: ${roleUserTarget?.name}`}
      >
        <form onSubmit={handleUpdateRole} className="space-y-4">
          <p className="text-xs text-zinc-400">
            Select the new permission level for <span className="text-white font-semibold">{roleUserTarget?.email}</span>.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Role Permission Level
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full rounded-xl border border-[#2e2a2b] bg-[#0c0b0c] px-4 py-2.5 text-xs text-white outline-none focus:border-[#931827] cursor-pointer"
            >
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#232021]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRoleUserTarget(null)}
              disabled={roleLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={roleLoading}>
              {roleLoading ? "Updating..." : "Save Role"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm: Delete House */}
      <ConfirmDialog
        isOpen={!!deleteHouseTarget}
        title={`Delete House: ${deleteHouseTarget?.name}?`}
        message="This action cannot be undone. Any affiliated participants will have their house affiliation unassigned."
        confirmLabel="Delete House"
        isDestructive={true}
        isLoading={houseLoading}
        onClose={() => setDeleteHouseTarget(null)}
        onConfirm={handleDeleteHouse}
      />

      {/* Confirm: Reset to Default Settings */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset all settings to default?"
        message="This will restore branding, colors, hero text, section visibility, and contact info to standard IZAZOV 9.0 defaults."
        confirmLabel="Reset Everything"
        isDestructive={true}
        isLoading={saving}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetToDefaults}
      />
    </div>
  );
}
