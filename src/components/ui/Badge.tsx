import React from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "rose"
  | "orange"
  | "blue"
  | "green"
  | "teal"
  | "amber";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = "default",
  className = "",
  dot = false,
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)]",
    primary: "bg-[var(--brand-muted)] text-[var(--brand)] border-[var(--brand)]/30 font-semibold",
    secondary: "bg-[#8D4B26]/12 text-[#8D4B26] dark:text-[#E0A47B] border-[#8D4B26]/30",
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    info: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
    neutral: "bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)]",
    rose: "bg-[#E94769]/10 text-[#E94769] border-[#E94769]/30",
    orange: "bg-[#F47738]/10 text-[#F47738] border-[#F47738]/30",
    blue: "bg-[#5789C1]/10 text-[#5789C1] border-[#5789C1]/30",
    green: "bg-[#4FA84A]/10 text-[#4FA84A] border-[#4FA84A]/30",
    teal: "bg-[#16B2A9]/10 text-[#16B2A9] border-[#16B2A9]/30",
    amber: "bg-[#D99A4E]/10 text-[#D99A4E] border-[#D99A4E]/30",
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: "bg-zinc-400",
    primary: "bg-[var(--brand)]",
    secondary: "bg-[#8D4B26]",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    neutral: "bg-zinc-400",
    rose: "bg-[#E94769]",
    orange: "bg-[#F47738]",
    blue: "bg-[#5789C1]",
    green: "bg-[#4FA84A]",
    teal: "bg-[#16B2A9]",
    amber: "bg-[#D99A4E]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`}
        />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  let variant: BadgeVariant = "default";

  switch (status.toUpperCase()) {
    case "LIVE":
    case "CONFIRMED":
    case "PRESENT":
    case "SUBMITTED":
    case "PUBLISHED":
      variant = "success";
      break;
    case "UPCOMING":
    case "PENDING":
    case "DRAFT":
      variant = "warning";
      break;
    case "COMPLETED":
    case "LOCKED":
      variant = "info";
      break;
    case "CANCELLED":
    case "DISQUALIFIED":
    case "ABSENT":
    case "URGENT":
      variant = "danger";
      break;
    case "IMPORTANT":
    case "GROUP":
      variant = "primary";
      break;
    case "LATE":
      variant = "warning";
      break;
    default:
      variant = "neutral";
  }

  return (
    <Badge variant={variant} dot>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
