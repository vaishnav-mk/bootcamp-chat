import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, onChange, ...props }: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: value,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(newEvent);
  };

  return (
    <input
      className={cn(
        "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed rounded",
        className,
      )}
      onChange={handleChange}
      {...props}
    />
  );
}
