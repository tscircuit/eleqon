import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { enWorkspace } from "@/lang/en/workspace";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-interface",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: enWorkspace.app.title,
  description: enWorkspace.app.description,
};

/** Provides the dark-only shell and shared typeface. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={enWorkspace.app.language} className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
