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
      className={`w-full overflow-x-auto rounded-2xl border border-[#272425] bg-[#121112] ${className}`}
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
      className={`w-full text-left text-sm text-zinc-300 border-collapse ${className}`}
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
      className={`border-b border-[#272425] bg-[#191718] text-xs font-semibold uppercase tracking-wider text-zinc-400 ${className}`}
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
      className={`divide-y divide-[#221f20] ${className}`}
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
      className={`transition-colors hover:bg-[#1c1a1b] ${
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
    <th className={`px-4 py-3.5 sm:px-6 ${className}`} {...props}>
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
    <td className={`px-4 py-4 sm:px-6 text-zinc-300 ${className}`} {...props}>
      {children}
    </td>
  );
}
