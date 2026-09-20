import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "./components/SiteChrome";

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
    icon: "/brandmark.svg",
    shortcut: "/brandmark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
