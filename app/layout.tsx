import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-workspace",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eleqon",
  description: "A local-first engineering workspace",
};

/** Provides the dark-only shell and shared typeface. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geistMono.variable}>
      <body>{children}</body>
    </html>
  );
}
