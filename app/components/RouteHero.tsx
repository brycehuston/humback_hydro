import { Arrow } from "./Icons";

const mobileHeroImages: Record<string, string> = {
  "/brand/hh-tech-module-transfer.webp": "/brand/hh-tech-module-transfer-mobile.webp",
  "/brand/hh-impact-framework.webp": "/brand/hh-impact-framework-mobile.webp",
  "/island-energy-water-approved.webp": "/island-energy-water-approved-mobile.webp",
  "/grid-data-center-night-approved.webp": "/grid-data-center-night-approved-mobile.webp",
  "/turbine-macro-approved.webp": "/turbine-macro-approved-mobile.webp",
  "/company/humpback-team-vancouver.webp": "/company/humpback-team-vancouver-mobile.webp",
};

export default function RouteHero({
  index,
  eyebrow,
  title,
  copy,
  image,
  imageAlt = "",
  imagePosition,
  mediaLabel = "CONCEPTUAL TECHNOLOGY ILLUSTRATION — NOT TO SCALE",
  nextHref,
  nextLabel,
  variant,
}: {
  index: string;
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
  imageAlt?: string;
  imagePosition?: string;
  mediaLabel?: string | null;
  nextHref?: string;
  nextLabel?: string;
  variant?: "decision";
}) {
  const mobileImage = mobileHeroImages[image];

  return (
    <section className={`route-hero${variant ? ` route-hero--${variant}` : ""}`}>
      <picture>
        {mobileImage ? <source media="(max-width: 760px)" srcSet={mobileImage} type="image/webp" /> : null}
        <img src={image} alt={imageAlt} fetchPriority="high" style={imagePosition ? { objectPosition: imagePosition } : undefined} />
      </picture>
      <div className="route-hero-overlay" />
      <div className="route-index">{index}</div>
      <div className="route-hero-copy">
        <p className="eyebrow"><span />{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
        {nextHref && nextLabel ? <a className="text-link light" href={nextHref}>{nextLabel}<Arrow direction="down" /></a> : null}
      </div>
      {mediaLabel ? <span className="concept-tag">{mediaLabel}</span> : null}
    </section>
  );
}
