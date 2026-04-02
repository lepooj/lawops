"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "draft" | "active" | "archived";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        {
          "bg-zinc-800 text-zinc-400": variant === "default",
          "bg-amber-950/60 text-amber-400": variant === "draft",
          "bg-emerald-950/60 text-emerald-400": variant === "active",
          "bg-zinc-800/60 text-zinc-500": variant === "archived",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
