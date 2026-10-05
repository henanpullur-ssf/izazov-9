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
      className={`p-5 relative overflow-hidden transition-all duration-200 hover:border-[#4a4244] ${
        highlight ? "border-[#931827]/60 bg-gradient-to-br from-[#1c1315] to-[#121112]" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-zinc-500 font-medium">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-xs font-medium ${
                trend.isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl border ${
            highlight
              ? "bg-[#931827]/20 border-[#931827]/40 text-red-400"
              : "bg-[#201d1e] border-[#312b2d] text-zinc-300"
          }`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
