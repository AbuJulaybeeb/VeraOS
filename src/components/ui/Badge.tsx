import React from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant =
  | "passed"
  | "failed"
  | "unverified"
  | "running"
  | "neutral"
  | "orange"
  | "purple";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className,
  dot = false,
  pulse = false,
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    passed: {
      container: "bg-[#14291e] text-[#4ade80] border border-[#22c55e]/30",
      dot: "bg-[#4ade80]",
    },
    failed: {
      container: "bg-error-container/50 text-error border border-error/30 font-semibold",
      dot: "bg-error",
    },
    unverified: {
      container: "bg-surface-variant text-on-surface-variant border border-white/10",
      dot: "bg-outline",
    },
    running: {
      container: "bg-secondary-container/30 text-secondary border border-secondary/30",
      dot: "bg-secondary",
    },
    orange: {
      container: "bg-primary-container/20 text-primary border border-primary-container/30",
      dot: "bg-primary-container",
    },
    purple: {
      container: "bg-tertiary-container/30 text-tertiary-fixed-dim border border-tertiary-container/30",
      dot: "bg-tertiary",
    },
    neutral: {
      container: "bg-surface-container text-outline border border-white/5",
      dot: "bg-outline",
    },
  };

  const current = variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded font-label-caps text-label-caps uppercase tracking-wider",
        current.container,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            current.dot,
            pulse && "animate-pulse"
          )}
        />
      )}
      {children}
    </span>
  );
};
