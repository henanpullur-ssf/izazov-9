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
      <Card className="max-w-md w-full p-8 text-center space-y-6 border-rose-500/40 bg-[var(--surface-card)] shadow-[var(--shadow-elevated)] relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500 shadow-md">
          <ShieldAlert className="w-8 h-8 stroke-[1.8]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Lock className="w-3 h-3" />
            <span>403 • Access Restricted</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Permission Required
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            {message ||
              "You don't have permission to access this section. Please contact your festival Super Admin if you need access to this module."}
          </p>

          {(moduleName || permissionName) && (
            <div className="mt-3 p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)]">
              {moduleName && <span>Module: <strong className="text-[var(--foreground)]">{moduleName}</strong></span>}
              {moduleName && permissionName && <span> • </span>}
              {permissionName && <span>Permission: <strong className="text-[var(--foreground)]">{permissionName}</strong></span>}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/admin" className="w-full sm:w-auto">
            <Button size="sm" className="w-full gap-2">
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
