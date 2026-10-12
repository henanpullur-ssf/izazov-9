import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2.5 font-semibold",
    };

    const variantStyles = {
      primary:
        "bg-[var(--brand)] text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] shadow-md shadow-[var(--brand)]/20 border border-[var(--brand-hover)]/40",
      secondary:
        "bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)]",
      outline:
        "border border-[var(--border-strong)] text-[var(--foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] hover:border-[var(--brand)]",
      danger:
        "bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/40 hover:bg-rose-500/20 hover:text-rose-700 dark:hover:text-rose-200",
      ghost:
        "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
