import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  actionElement?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  actionElement,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#2f2b2c] bg-[#121112]">
      <div className="w-12 h-12 rounded-2xl bg-[#231f20] border border-[#383334] flex items-center justify-center text-zinc-400 mb-4">
        {icon || <FolderOpen className="w-6 h-6 text-zinc-500" />}
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6">{description}</p>
      {actionElement}
      {!actionElement && actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
      {!actionElement && actionLabel && actionHref && (
        <a href={actionHref}>
          <Button size="sm">{actionLabel}</Button>
        </a>
      )}
    </div>
  );
}
