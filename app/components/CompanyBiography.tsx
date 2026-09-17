"use client";

import { useState } from "react";

export default function CompanyBiography({
  id,
  paragraphs,
  className,
}: {
  id: string;
  paragraphs: readonly string[];
  className: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [intro, ...remaining] = paragraphs;

  return (
    <div className={`${className} company-biography`}>
      <p className="m-0">{intro}</p>
      <div id={id} className="company-biography-extra" data-expanded={expanded}>
        {remaining.map((paragraph) => <p className="m-0" key={paragraph}>{paragraph}</p>)}
      </div>
      {remaining.length ? (
        <button
          type="button"
          className="company-biography-toggle"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Collapse Biography" : "Read Full Biography"}
        </button>
      ) : null}
    </div>
  );
}
