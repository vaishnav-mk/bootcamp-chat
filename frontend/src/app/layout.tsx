import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LowercaseProvider } from "@/components/providers/LowercaseProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "chat app",
  description: "real-time chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-900 text-white h-screen`}
      >
        <LowercaseProvider>
          <AuthProvider>{children}</AuthProvider>
          <ToastProvider />
        </LowercaseProvider>
      </body>
    </html>
  );
}
