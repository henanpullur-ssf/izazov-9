"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { X } from "lucide-react";

export function AdminLayoutClient({
  user,
  children,
}: {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#000000] text-white">
      {/* Desktop fixed sidebar */}
      <div className="hidden lg:block lg:w-64 lg:shrink-0 fixed inset-y-0 left-0 z-40">
        <AdminSidebar userRole={user?.role || undefined} />
      </div>

      {/* Mobile drawer backdrop & sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#111011] shadow-2xl flex flex-col z-50">
            <div className="absolute right-3 top-4 z-10">
              <button
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-[#201d1e]"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminSidebar
              userRole={user?.role || undefined}
              onItemClick={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        <AdminHeader
          user={user}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
