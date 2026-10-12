"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { useTheme, type Theme } from "./ThemeProvider";

export interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
  variant?: "dropdown" | "cycle" | "segmented";
}

export function ThemeToggle({
  className = "",
  size = "md",
  variant = "dropdown",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Avoid SSR hydration flash by mounting check
    const t = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const sizeClasses =
    size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-4 h-4";

  // Segmented control variant (ideal for settings / admin pages)
  if (variant === "segmented") {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] ${className}`}
        role="radiogroup"
        aria-label="Color theme selection"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          role="radio"
          aria-checked={theme === "light"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            theme === "light"
              ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          role="radio"
          aria-checked={theme === "dark"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            theme === "dark"
              ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-blue-400" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          role="radio"
          aria-checked={theme === "system"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            theme === "system"
              ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Laptop className="w-3.5 h-3.5 text-emerald-500" />
          <span>System</span>
        </button>
      </div>
    );
  }

  // Cycle variant (quick toggle on click)
  if (variant === "cycle") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--brand)] hover:bg-[var(--surface-elevated)] transition cursor-pointer ${sizeClasses} ${className}`}
        aria-label={
          mounted
            ? `Current theme: ${resolvedTheme}. Click to switch to ${
                resolvedTheme === "dark" ? "light" : "dark"
              } mode.`
            : "Toggle theme"
        }
      >
        {mounted && resolvedTheme === "light" ? (
          <Sun className={`${iconSize} text-amber-500`} />
        ) : (
          <Moon className={`${iconSize} text-blue-400`} />
        )}
      </button>
    );
  }

  // Dropdown variant (standard in navbars with accessible popover)
  const options: { id: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Laptop },
  ];

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={
          mounted
            ? `Theme: ${theme}. Click to change theme.`
            : "Change color theme"
        }
        className={`inline-flex items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--brand)] hover:bg-[var(--surface-elevated)] transition cursor-pointer ${sizeClasses}`}
      >
        {mounted ? (
          resolvedTheme === "light" ? (
            <Sun className={`${iconSize} text-amber-500`} />
          ) : (
            <Moon className={`${iconSize} text-blue-400`} />
          )
        ) : (
          <span className={`${iconSize} opacity-0`} />
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Select theme"
          className="absolute right-0 mt-2 w-36 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-1.5 shadow-xl shadow-black/15 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                role="menuitem"
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? "bg-[var(--brand-muted)] text-[var(--brand)] font-semibold"
                    : "text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      opt.id === "light"
                        ? "text-amber-500"
                        : opt.id === "dark"
                        ? "text-blue-400"
                        : "text-emerald-500"
                    }`}
                  />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--brand)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
