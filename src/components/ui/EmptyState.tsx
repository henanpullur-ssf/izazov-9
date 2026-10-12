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
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-card)]">
      <div className="w-12 h-12 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mb-4">
        {icon || <FolderOpen className="w-6 h-6 text-[var(--text-dim)]" />}
      </div>
      <h3 className="text-base font-semibold text-[var(--foreground)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">{description}</p>
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
