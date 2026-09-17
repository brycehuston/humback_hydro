import type { Metadata } from "next";

export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = `https://humpbackenergy.com${path}`;
  const image = "https://humpbackenergy.com/hero-ai-power-campus.webp";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Humpback Hydro`, description, url,
      siteName: "Humpback Hydro", type: "website",
      images: [{ url: image, alt: "Conceptual technology illustration of a coastal energy campus" }],
    },
    twitter: { card: "summary_large_image", title: `${title} | Humpback Hydro`, description, images: [image] },
  };
}
