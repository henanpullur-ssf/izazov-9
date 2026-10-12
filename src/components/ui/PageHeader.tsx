import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] mb-6">
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-2">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.label}>
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-[var(--foreground)] transition"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-[var(--foreground)] font-semibold" : ""}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && (
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[var(--text-muted)] max-w-2xl">{description}</p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
