import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded",
        {
          "bg-blue-600 hover:bg-blue-700 text-white": variant === "primary",
          "bg-zinc-700 hover:bg-zinc-600 text-white": variant === "secondary",
          "hover:bg-zinc-700 text-zinc-300": variant === "ghost",
          "bg-red-600 hover:bg-red-700 text-white": variant === "danger",
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
