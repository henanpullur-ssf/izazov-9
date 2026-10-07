"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function AccessDenied({
  moduleName,
  permissionName,
  message,
}: {
  moduleName?: string;
  permissionName?: string;
  message?: string;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 border-red-900/50 bg-gradient-to-b from-[#1c1214] via-[#141011] to-[#0f0e0f] shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-700/60 flex items-center justify-center mx-auto text-red-400 shadow-xl shadow-red-950/50">
          <ShieldAlert className="w-8 h-8 stroke-[1.8]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-[10px] font-mono font-bold uppercase tracking-wider text-red-400">
            <Lock className="w-3 h-3" />
            <span>403 • Access Restricted</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Permission Required
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {message ||
              "You don't have permission to access this section. Please contact your festival Super Admin if you need access to this module."}
          </p>

          {(moduleName || permissionName) && (
            <div className="mt-3 p-3 rounded-xl bg-[#0c0a0b] border border-[#261f21] text-xs font-mono text-zinc-400">
              {moduleName && <span>Module: <strong className="text-zinc-200">{moduleName}</strong></span>}
              {moduleName && permissionName && <span> • </span>}
              {permissionName && <span>Permission: <strong className="text-zinc-200">{permissionName}</strong></span>}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#2d1e21] flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/admin" className="w-full sm:w-auto">
            <Button size="sm" className="w-full gap-2">
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#332b2d] bg-[#1a1718] text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#262123] transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
