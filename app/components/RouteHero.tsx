import { Arrow } from "./Icons";

export default function RouteHero({
  index,
  eyebrow,
  title,
  copy,
  image,
  nextHref,
  nextLabel,
}: {
  index: string;
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
  nextHref?: string;
  nextLabel?: string;
}) {
  return (
    <section className="route-hero">
      <img src={image} alt="" fetchPriority="high" />
      <div className="route-hero-overlay" />
      <div className="route-index">{index}</div>
      <div className="route-hero-copy">
        <p className="eyebrow"><span />{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
        {nextHref && nextLabel ? <a className="text-link light" href={nextHref}>{nextLabel}<Arrow direction="down" /></a> : null}
      </div>
      <span className="concept-tag">CONCEPT VISUALIZATION</span>
    </section>
  );
}
