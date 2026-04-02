"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", asChild = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50",
          {
            "bg-indigo-600 text-white hover:bg-indigo-500": variant === "primary",
            "border border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-800":
              variant === "secondary",
            "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200":
              variant === "ghost",
            "bg-red-600/80 text-white hover:bg-red-600": variant === "danger",
          },
          {
            "px-3 py-1.5 text-xs": size === "sm",
            "px-4 py-2 text-sm": size === "md",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
