import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed rounded resize-none",
        className,
      )}
      {...props}
    />
  );
}