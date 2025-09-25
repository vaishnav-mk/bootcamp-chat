"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#18181b",
          color: "#fafafa",
          border: "1px solid #3f3f46",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#fafafa",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fafafa",
          },
        },
      }}
    />
  );
}
