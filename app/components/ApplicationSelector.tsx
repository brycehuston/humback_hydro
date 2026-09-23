"use client";

import { useId, useState } from "react";
import { applications } from "../data";
import { Arrow, Check } from "./Icons";

export default function ApplicationSelector({ expanded = false }: { expanded?: boolean }) {
  const [activeId, setActiveId] = useState(applications[0].id);
  const id = useId();
  const active = applications.find((application) => application.id === activeId) ?? applications[0];

  return (
    <div className={`application-selector ${expanded ? "expanded" : ""}`}>
      <div className="application-tabs" role="tablist" aria-label="Infrastructure applications">
        {applications.map((application, index) => (
          <button
            key={application.id}
            type="button"
            role="tab"
            id={`${id}-${application.id}`}
            aria-controls={`${id}-panel`}
            tabIndex={active.id === application.id ? 0 : -1}
            aria-selected={active.id === application.id}
            onClick={() => setActiveId(application.id)}
            onKeyDown={(event) => {
              const offset = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 0;
              if (!offset && !["Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === "Home" ? 0 : event.key === "End" ? applications.length - 1 : (index + offset + applications.length) % applications.length;
              setActiveId(applications[next].id);
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
            }}
          >
            <span>0{index + 1}</span>{application.label}
          </button>
        ))}
      </div>

      <div className="application-stage" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${active.id}`} tabIndex={0}>
        <img key={active.image} src={active.image} alt={`${active.label} conceptual technology illustration`} data-application-id={active.id} loading="lazy" decoding="async" />
        <div className="application-overlay" />
        <div className="application-copy" key={active.id}>
          <small>{active.kicker}</small>
          <h3>{active.title}</h3>
          <p>{active.description}</p>
          <ul>
            {active.points.map((point) => <li key={point}><Check />{point}</li>)}
          </ul>
          <a className="text-link light" href={`/partners?interest=${active.id}`}>{active.cta} <Arrow /></a>
        </div>
        <span className="concept-tag">CONCEPTUAL TECHNOLOGY ILLUSTRATION — NOT TO SCALE</span>
      </div>
    </div>
  );
}
