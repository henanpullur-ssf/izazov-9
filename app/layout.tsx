import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "IZAZOV 9.0 — Campus Fest Operations & Management Platform",
  description:
    "Official operations, competitions, scoring, schedule, and results platform for IZAZOV 9.0.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#000000]`}
    >
      <body className="min-h-full flex flex-col bg-[#000000] text-white font-sans selection:bg-[#931827]">
        {children}
      </body>
    </html>
  );
}
