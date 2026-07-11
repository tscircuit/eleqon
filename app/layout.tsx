import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-interface",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eleqon",
  description: "A local-first engineering workspace",
};

/** Provides the dark-only shell and shared typeface. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
