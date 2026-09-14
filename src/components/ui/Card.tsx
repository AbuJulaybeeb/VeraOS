import React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "low" | "high" | "lowest";
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const variantStyles = {
    lowest: "bg-surface-container-lowest border border-white/5",
    low: "bg-surface-container-low/80 backdrop-blur-xl border border-white/10",
    default: "bg-surface-container/90 backdrop-blur-xl border border-white/10",
    high: "bg-surface-container-high/90 backdrop-blur-xl border border-white/10",
  };

  return (
    <div
      className={cn("rounded-xl p-5 shadow-md", variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};
