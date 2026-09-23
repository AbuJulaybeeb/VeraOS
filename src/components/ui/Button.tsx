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
        "bg-[#C96A2B] hover:bg-[#E08A3E] text-white font-semibold border border-[#E08A3E]/30 shadow-[0_0_16px_rgba(201,106,43,0.3)] active:scale-[0.98]",
      secondary:
        "bg-[#2C1710] hover:bg-[#3A2015] text-[#FFF8F0] font-medium border border-[#4A2B1D] hover:border-[#63361F] active:scale-[0.98]",
      outline:
        "bg-transparent hover:bg-[#21110B] text-[#FFF8F0] font-medium border border-[#4A2B1D] hover:border-[#E08A3E]/50 active:scale-[0.98]",
      ghost:
        "bg-transparent hover:bg-[#21110B] text-[#B9A99B] hover:text-[#FFF8F0] font-medium",
      danger:
        "bg-[#2a1210] hover:bg-[#3d1a17] text-[#fca5a5] font-semibold border border-[#5c1e19]",
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

