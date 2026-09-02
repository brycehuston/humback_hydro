import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "./components/SiteChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Humpback Hydro | Modular Hydroelectric Infrastructure",
    template: "%s | Humpback Hydro",
  },
  description:
    "A Canadian energy technology company developing modular hydroelectric generation and long-duration energy storage infrastructure.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/brandmark.webp",
    shortcut: "/brandmark.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
