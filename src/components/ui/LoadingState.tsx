import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({
  size = "md",
  className = "",
  label,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-8 ${className}`}
    >
      <Loader2
        className={`${sizeMap[size]} animate-spin text-[#931827]`}
      />
      {label && <p className="text-xs text-zinc-400">{label}</p>}
    </div>
  );
}

export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#201d1e] ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 p-4">
      <Skeleton className="h-8 w-full rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  );
}
