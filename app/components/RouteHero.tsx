import { Arrow } from "./Icons";

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
  return (
    <section className={`route-hero${variant ? ` route-hero--${variant}` : ""}`}>
      <img src={image} alt={imageAlt} fetchPriority="high" style={imagePosition ? { objectPosition: imagePosition } : undefined} />
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
