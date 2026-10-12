import React, { TableHTMLAttributes, HTMLAttributes } from "react";

export function TableContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Table({
  children,
  className = "",
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={`w-full text-left text-sm text-[var(--foreground)] border-collapse ${className}`}
      {...props}
    >
      {children}
    </table>
  );
}

export function TableHead({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={`divide-y divide-[var(--border-subtle)] ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = "",
  clickable = false,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { clickable?: boolean }) {
  return (
    <tr
      className={`transition-colors hover:bg-[var(--surface-hover)] ${
        clickable ? "cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHeader({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-4 py-3.5 sm:px-6 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-4 sm:px-6 text-[var(--foreground)] ${className}`} {...props}>
      {children}
    </td>
  );
}
