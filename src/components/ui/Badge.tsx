import React from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

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
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
    primary: "bg-[#931827]/20 text-red-300 border-[#931827]/50",
    success: "bg-emerald-950/40 text-emerald-300 border-emerald-800/60",
    warning: "bg-amber-950/40 text-amber-300 border-amber-800/60",
    danger: "bg-rose-950/40 text-rose-300 border-rose-800/60",
    info: "bg-cyan-950/40 text-cyan-300 border-cyan-800/60",
    neutral: "bg-[#181718] text-zinc-400 border-[#2d292a]",
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: "bg-zinc-400",
    primary: "bg-red-500",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-rose-500",
    info: "bg-cyan-400",
    neutral: "bg-zinc-500",
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
