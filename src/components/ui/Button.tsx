import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      loading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-heading transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#E08A3E]/40 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[#181311] hover:bg-[#2A2422] text-white font-medium border border-black/10 shadow-sm active:scale-[0.98]",
      secondary:
        "bg-white hover:bg-[#FAF8F5] text-[#191513] font-medium border border-[#E8E4DC] active:scale-[0.98]",
      outline:
        "bg-transparent hover:bg-[#FAF8F5] text-[#191513] font-medium border border-[#E8E4DC] active:scale-[0.98]",
      ghost:
        "bg-transparent hover:bg-[#F0ECE1] text-[#706864] hover:text-[#191513] font-medium",
      accent:
        "bg-[#D97736] hover:bg-[#E28543] text-white font-medium shadow-sm active:scale-[0.98]",
      cream:
        "bg-[#F3E8DC] hover:bg-[#EBDDCF] text-[#181311] font-medium border border-[#E6D8CA] active:scale-[0.98]",
      danger:
        "bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] font-medium border border-[#FECACA]",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
      md: "text-sm px-4 py-2 rounded-xl gap-2",
      lg: "text-sm sm:text-base px-6 py-3 rounded-xl gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          icon && <span className="shrink-0 flex items-center">{icon}</span>
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";

