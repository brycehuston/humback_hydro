"use client";

import { useState } from "react";
import { applications } from "../data";
import { Arrow, Check } from "./Icons";

export default function ApplicationSelector({ expanded = false }: { expanded?: boolean }) {
  const [activeId, setActiveId] = useState(applications[0].id);
  const active = applications.find((application) => application.id === activeId) ?? applications[0];

  return (
    <div className={`application-selector ${expanded ? "expanded" : ""}`}>
      <div className="application-tabs" role="tablist" aria-label="Infrastructure applications">
        {applications.map((application, index) => (
          <button
            key={application.id}
            type="button"
            role="tab"
            aria-selected={active.id === application.id}
            onClick={() => setActiveId(application.id)}
          >
            <span>0{index + 1}</span>{application.label}
          </button>
        ))}
      </div>

      <div className="application-stage">
        <img key={active.image} src={active.image} alt={`${active.label} concept visualization`} loading="lazy" decoding="async" />
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
        <span className="concept-tag">CONCEPT VISUALIZATION</span>
      </div>
    </div>
  );
}
