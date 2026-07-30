import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ab41] disabled:pointer-events-none disabled:opacity-50 rounded-xl cursor-pointer active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#008631] text-white hover:bg-[#00ab41] active:bg-[#006825] shadow-md shadow-[#008631]/20",
      secondary:
        "bg-[#008631]/10 text-[#00ab41] hover:bg-[#008631]/20 active:bg-[#008631]/30 dark:bg-[#00ab41]/15 dark:text-[#00ab41]",
      outline:
        "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-100 dark:hover:bg-zinc-900",
      ghost:
        "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm",
    };

    const sizes = {
      sm: "h-9 px-3.5 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
