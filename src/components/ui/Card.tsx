import React, { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({
  className = "",
  elevated = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-150 ${
        elevated
          ? "bg-[var(--surface-elevated)] border-[var(--border-strong)] shadow-[var(--shadow-elevated)]"
          : "bg-[var(--surface-card)] border-[var(--border-subtle)] shadow-[var(--shadow-card)]"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-5 sm:p-6 border-b border-[var(--border-subtle)] flex flex-col gap-1.5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-semibold text-[var(--foreground)] tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-[var(--text-muted)] ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-5 sm:p-6 pt-0 border-t border-[var(--border-subtle)] mt-auto flex items-center ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
