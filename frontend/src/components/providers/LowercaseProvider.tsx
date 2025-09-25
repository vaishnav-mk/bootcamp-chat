"use client";

import { useLowercase } from "@/hooks/useLowercase";

export function LowercaseProvider({ children }: { children: React.ReactNode }) {
  // useLowercase();
  return <>{children}</>;
}
