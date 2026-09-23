import React from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant =
  | "passed"
  | "failed"
  | "unverified"
  | "running"
  | "neutral"
  | "orange";

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
      container: "bg-[#142818] text-[#4ade80] border border-[#1b4324]",
      dot: "bg-[#4ade80]",
    },
    failed: {
      container: "bg-[#2a1210] text-[#f87171] border border-[#5c1e19] font-semibold",
      dot: "bg-[#f87171]",
    },
    unverified: {
      container: "bg-[#2b1c10] text-[#E6A15A] border border-[#54331a]",
      dot: "bg-[#E6A15A]",
    },
    running: {
      container: "bg-[#2C1710] text-[#E08A3E] border border-[#4A2B1D]",
      dot: "bg-[#E08A3E]",
    },
    orange: {
      container: "bg-[#2C1710] text-[#C96A2B] border border-[#E08A3E]/40",
      dot: "bg-[#C96A2B]",
    },
    neutral: {
      container: "bg-[#21110B] text-[#B9A99B] border border-[#4A2B1D]",
      dot: "bg-[#B9A99B]",
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
