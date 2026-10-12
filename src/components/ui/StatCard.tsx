import React from "react";
import { Card } from "./Card";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlight?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
}: StatCardProps) {
  return (
    <Card
      className={`p-5 relative overflow-hidden transition-all duration-200 hover:border-[var(--brand)] ${
        highlight
          ? "border-[var(--brand)]/60 bg-[var(--surface-elevated)]"
          : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[var(--text-dim)] font-medium">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-xs font-medium ${
                trend.isPositive ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl border ${
            highlight
              ? "bg-[var(--brand-muted)] border-[var(--brand)]/40 text-[var(--brand)]"
              : "bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--foreground)]"
          }`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
