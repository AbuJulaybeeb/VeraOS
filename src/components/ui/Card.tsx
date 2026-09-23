import React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "low" | "high" | "lowest" | "elevated";
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const variantStyles = {
    lowest: "bg-[#160C08] border border-[#4A2B1D]",
    low: "bg-[#21110B] border border-[#4A2B1D]",
    default: "bg-[#2C1710] border border-[#4A2B1D]",
    high: "bg-[#3A2015] border border-[#4A2B1D]",
    elevated: "bg-[#4A2819] border border-[#63361F] shadow-lg",
  };

  return (
    <div
      className={cn("rounded-2xl p-5 shadow-sm transition-all", variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};
