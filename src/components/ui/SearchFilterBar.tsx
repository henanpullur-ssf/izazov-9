import React from "react";
import { Search } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    id: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  children?: React.ReactNode;
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  children,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-[#2d292a] bg-[#0f0e0f] pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#931827] focus:ring-1 focus:ring-[#931827]"
          />
        </div>

        {/* Dropdown filters */}
        {filters.map((filter) => (
          <select
            key={filter.id}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            aria-label={filter.label}
            className="rounded-xl border border-[#2d292a] bg-[#0f0e0f] px-3.5 py-2 text-sm text-zinc-300 outline-none transition focus:border-[#931827] cursor-pointer"
          >
            {filter.options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-[#141314] text-white"
              >
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {children && (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      )}
    </div>
  );
}
