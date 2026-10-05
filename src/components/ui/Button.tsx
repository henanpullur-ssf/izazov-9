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
      "inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#931827]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2.5 text-sm gap-2",
      lg: "px-6 py-3.5 text-base gap-2.5 font-semibold",
    };

    const variantStyles = {
      primary:
        "bg-[#931827] text-white hover:bg-[#ab1d2f] shadow-md shadow-[#931827]/20 border border-[#ab1d2f]/40",
      secondary:
        "bg-[#231f20] text-zinc-100 hover:bg-[#2d292a] border border-[#3f393b]/60",
      outline:
        "border border-[#3f393b] text-zinc-300 hover:text-white hover:bg-[#181718] hover:border-zinc-600",
      danger:
        "bg-red-950/60 text-red-300 border border-red-800/80 hover:bg-red-900/60 hover:text-red-200",
      ghost:
        "text-zinc-400 hover:text-white hover:bg-[#231f20]/60",
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
