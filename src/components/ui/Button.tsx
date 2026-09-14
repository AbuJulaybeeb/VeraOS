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
      "inline-flex items-center justify-center font-headline-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container/40 disabled:opacity-50 disabled:pointer-events-none select-none";

    const variantStyles = {
      primary:
        "bg-primary-container hover:bg-[#e04c05] text-on-primary font-semibold border border-primary-container/40 shadow-sm",
      secondary:
        "bg-surface-container hover:bg-surface-container-high text-on-surface border border-white/5 hover:border-white/10",
      outline:
        "bg-transparent hover:bg-surface-container text-on-surface border border-white/15 hover:border-white/25",
      ghost:
        "bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface",
      danger:
        "bg-error-container/60 hover:bg-error-container text-on-error-container border border-error/30 font-semibold",
    };

    const sizeStyles = {
      sm: "text-body-sm px-3 py-1.5 rounded-md gap-1.5",
      md: "text-body-md px-4 py-2 rounded-lg gap-2",
      lg: "text-headline-sm px-6 py-3 rounded-lg gap-2.5",
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

