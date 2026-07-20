"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Arrow } from "./Icons";

const CYCLE_DURATION = 6200;

const stages = [
  {
    number: "01",
    label: "Capture",
    title: "Receive Available Clean Energy",
    description: "The system is designed to use available energy to move water into a stored position.",
    mode: "PUMP MODE",
    signal: "ENERGY → ELEVATION",
    telemetry: { rpm: 486, flow: 74.2, output: 18.4 },
  },
  {
    number: "02",
    label: "Store",
    title: "Hold Energy Gravitationally",
    description: "Elevated water preserves energy as durable gravitational potential for later use.",
    mode: "STORAGE MODE",
    signal: "ELEVATION → RESERVE",
    telemetry: { rpm: 0, flow: 2.1, output: 0.4 },
  },
  {
    number: "03",
    label: "Dispatch",
    title: "Return Power on Demand",
    description: "Stored water is released through a reversible turbine to deliver dependable power.",
    mode: "GENERATION MODE",
    signal: "RESERVE → POWER",
    telemetry: { rpm: 432, flow: 68.7, output: 21.8 },
  },
  {
    number: "04",
    label: "Repeat",
    title: "Operate as Infrastructure",
    description: "The cycle is designed for repeatable use alongside grids, renewables and critical loads.",
    mode: "CONTINUOUS CYCLE",
    signal: "GENERATE → STORE → DISPATCH",
    telemetry: { rpm: 38, flow: 8.4, output: 1.2 },
  },
];

const particles = Array.from({ length: 24 }, (_, index) => ({
  x: `${12 + ((index * 31) % 76)}%`,
  size: `${1.5 + (index % 4) * 0.7}px`,
  speed: `${0.72 + (index % 6) * 0.12}s`,
  delay: `${-((index * 0.19) % 2.4)}s`,
}));

const hotspots = [
  { x: "31%", y: "27%", title: "Upper Reservoir", line1: "Hydraulic storage zone", line2: "Level sensor · L-401" },
  { x: "49%", y: "52%", title: "Reversible Turbine", line1: "Bidirectional operating mode", line2: "Telemetry channel · T-110" },
  { x: "68%", y: "73%", title: "Marine Reservoir", line1: "Ambient-pressure water source", line2: "Depth sensor · D-204" },
];

export default function SystemExplorer({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [telemetry, setTelemetry] = useState(stages[0].telemetry);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const clickAudioRef = useRef<HTMLAudioElement>(null);
  const humAudioRef = useRef<HTMLAudioElement>(null);
  const activeRef = useRef(0);
  const pausedRef = useRef(false);
  const visibleRef = useRef(false);
  const audioUnlockedRef = useRef(false);
  const elapsedRef = useRef(0);
  const lastFrameRef = useRef(0);
  const parallaxFrameRef = useRef<number | null>(null);
  const humFadeRef = useRef<number | null>(null);
  const stage = stages[active];

  const fadeHum = useCallback((target: number) => {
    const hum = humAudioRef.current;
    if (!hum || !audioUnlockedRef.current) return;
    if (humFadeRef.current) window.clearInterval(humFadeRef.current);

    if (target > 0 && hum.paused) {
      hum.play().catch(() => undefined);
    }

    humFadeRef.current = window.setInterval(() => {
      const difference = target - hum.volume;
      if (Math.abs(difference) < 0.01) {
        hum.volume = target;
        if (humFadeRef.current) window.clearInterval(humFadeRef.current);
        humFadeRef.current = null;
        if (target === 0) hum.pause();
        return;
      }
      hum.volume = Math.max(0, Math.min(1, hum.volume + difference * 0.16));
    }, 30);
  }, []);

  const unlockAudio = () => {
    if (audioUnlockedRef.current) return;
    audioUnlockedRef.current = true;
    const hum = humAudioRef.current;
    if (!hum) return;
    hum.volume = 0;
    if (activeRef.current === 0 || activeRef.current === 2) {
      hum.play().then(() => fadeHum(0.18)).catch(() => undefined);
    }
  };

  const playClick = () => {
    const click = clickAudioRef.current;
    if (!click) return;
    click.currentTime = 0;
    click.volume = 0.36;
    click.play().catch(() => undefined);
  };

  const selectStage = (index: number, withSound = true) => {
    elapsedRef.current = 0;
    rootRef.current?.style.setProperty("--cycle-progress", "0");
    if (withSound) {
      unlockAudio();
      playClick();
    }
    setActive(index);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    }, { threshold: 0.3 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    activeRef.current = active;
    elapsedRef.current = 0;
    rootRef.current?.style.setProperty("--cycle-progress", "0");
    fadeHum(audioUnlockedRef.current && (active === 0 || active === 2) ? 0.18 : 0);
  }, [active, fadeHum]);

  useEffect(() => {
    const target = stages[active].telemetry;
    let liveTimer: number | undefined;
    const burstTimer = window.setInterval(() => {
      setTelemetry({
        rpm: Math.floor(Math.random() * 900),
        flow: Number((Math.random() * 96).toFixed(1)),
        output: Number((Math.random() * 32).toFixed(1)),
      });
    }, 48);

    const settleTimer = window.setTimeout(() => {
      window.clearInterval(burstTimer);
      const update = () => setTelemetry({
        rpm: Math.max(0, target.rpm + (target.rpm ? Math.round((Math.random() - 0.5) * 12) : 0)),
        flow: Math.max(0, Number((target.flow + (Math.random() - 0.5) * 1.1).toFixed(1))),
        output: Math.max(0, Number((target.output + (Math.random() - 0.5) * 0.5).toFixed(1))),
      });
      update();
      liveTimer = window.setInterval(update, 520);
    }, 760);

    return () => {
      window.clearInterval(burstTimer);
      window.clearTimeout(settleTimer);
      if (liveTimer) window.clearInterval(liveTimer);
    };
  }, [active]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const tick = (now: number) => {
      const last = lastFrameRef.current || now;
      const delta = Math.min(now - last, 100);
      lastFrameRef.current = now;

      if (visibleRef.current && !pausedRef.current && !reducedMotion.matches) {
        elapsedRef.current += delta;
        const progress = Math.min(100, (elapsedRef.current / CYCLE_DURATION) * 100);
        rootRef.current?.style.setProperty("--cycle-progress", progress.toFixed(2));
        if (progress >= 100) {
          elapsedRef.current = 0;
          setActive((current) => (current + 1) % stages.length);
        }
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => () => {
    if (humFadeRef.current) window.clearInterval(humFadeRef.current);
    humAudioRef.current?.pause();
  }, []);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const element = stageRef.current;
    if (!element || parallaxFrameRef.current !== null) return;
    const { clientX, clientY } = event;
    parallaxFrameRef.current = window.requestAnimationFrame(() => {
      const bounds = element.getBoundingClientRect();
      const x = ((clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((clientY - bounds.top) / bounds.height - 0.5) * 2;
      element.style.setProperty("--backdrop-x", `${x * -5}px`);
      element.style.setProperty("--backdrop-y", `${y * -3}px`);
      element.style.setProperty("--structure-x", `${x * 10}px`);
      element.style.setProperty("--structure-y", `${y * 7}px`);
      parallaxFrameRef.current = null;
    });
  };

  const resetParallax = () => {
    const element = stageRef.current;
    if (!element) return;
    element.style.setProperty("--backdrop-x", "0px");
    element.style.setProperty("--backdrop-y", "0px");
    element.style.setProperty("--structure-x", "0px");
    element.style.setProperty("--structure-y", "0px");
  };

  return (
    <div
      ref={rootRef}
      className={`system-explorer ${compact ? "compact" : ""} ${paused ? "is-paused" : ""}`}
    >
      <div className="system-visual-shell">
        <div
          ref={stageRef}
          className="system-stage"
          data-stage={active + 1}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetParallax}
          onPointerDown={unlockAudio}
        >
          <div className="system-backdrop-layer" aria-hidden="true"><img src="/system-cutaway.webp" alt="" /></div>
          <div className="system-structure-layer"><img src="/system-cutaway.webp" alt="Concept visualization of a marine pumped-hydro system" loading="lazy" decoding="async" /></div>
          <div className="system-ambient" aria-hidden="true" />
          <div className="system-internal-lights" aria-hidden="true" />

          <div className="reservoir-water" aria-hidden="true"><i /><span /></div>

          <svg className="system-conduits" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
            <defs><filter id="systemConduitGlow"><feGaussianBlur stdDeviation="3.4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
            <path pathLength="100" d="M70 190 C260 190 350 315 492 380" />
            <path pathLength="100" d="M930 190 C745 190 650 315 492 380" />
            <path pathLength="100" d="M492 665 C492 565 492 470 492 380" />
          </svg>

          <div className="hydro-pipe" aria-hidden="true">
            {particles.map((particle, index) => (
              <i key={index} style={{
                "--particle-x": particle.x,
                "--particle-size": particle.size,
                "--particle-speed": particle.speed,
                "--particle-delay": particle.delay,
              } as CSSProperties} />
            ))}
          </div>

          <div className="system-turbine" aria-hidden="true">
            <div className="turbine-halo" />
            <div className="turbine-rotor">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div>
            <span />
          </div>

          <div className="system-vignette" />
          <div className="system-pressure" aria-hidden="true"><i /><i /><i /></div>
          <div className="energy-path" aria-hidden="true"><i /><i /><i /></div>

          {hotspots.map((hotspot) => (
            <button
              key={hotspot.title}
              type="button"
              className="system-hotspot"
              style={{ "--hotspot-x": hotspot.x, "--hotspot-y": hotspot.y } as CSSProperties}
              aria-label={`${hotspot.title} technical data`}
            >
              <i /><span><strong>{hotspot.title}</strong><small>{hotspot.line1}</small><small>{hotspot.line2}</small></span>
            </button>
          ))}

          <div className="system-coordinate top"><span />UPPER RESERVOIR</div>
          <div className="system-coordinate center"><span />REVERSIBLE TURBINE</div>
          <div className="system-coordinate bottom"><span />MARINE RESERVOIR</div>
          <span className="concept-tag">CONCEPT VISUALIZATION</span>

          <div className="stage-readout">
            <div className="cycle-ring" aria-hidden="true">
              <svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" /><circle className="cycle-ring-value" pathLength="100" cx="22" cy="22" r="18" /></svg>
              <strong>{stage.number}</strong>
            </div>
            <div><small>ACTIVE SEQUENCE</small><span>{stage.label}</span></div>
          </div>

          <div className="system-telemetry" aria-live="polite">
            <div><i />LIVE TELEMETRY</div>
            <p><span>RPM</span><strong>{String(telemetry.rpm).padStart(3, "0")}</strong></p>
            <p><span>FLOW</span><strong>{telemetry.flow.toFixed(1)} <small>m³/s</small></strong></p>
            <p><span>OUTPUT</span><strong>{telemetry.output.toFixed(1)} <small>MW</small></strong></p>
          </div>

          <div className="system-flow-state" key={`flow-${stage.number}`}><small>FLOW STATE</small><strong>{stage.mode}</strong><span>{stage.signal}</span></div>
          <div className="system-live"><i /><span>OPERATING MODEL</span><small>LIVE DIGITAL TWIN</small></div>
        </div>
      </div>

      <div className="system-controls">
        <div className="system-controls-head">
          <span>OPERATING SEQUENCE / 04 STAGES</span>
          <button className="cycle-toggle" type="button" aria-label={paused ? "Resume automatic cycle" : "Pause automatic cycle"} onClick={() => setPaused((value) => !value)}>
            <i className={paused ? "play" : "pause"} />
          </button>
        </div>
        <div className="system-copy" key={stage.number} aria-live="polite">
          <small>{stage.number} / 04 · {stage.label}</small>
          <h3>{stage.title}</h3>
          <p>{stage.description}</p>
        </div>
        <div className="stage-tabs" role="tablist" aria-label="Operating sequence">
          {stages.map((item, index) => (
            <button
              key={item.number}
              type="button"
              role="tab"
              aria-selected={active === index}
              onClick={() => selectStage(index)}
            >
              <span>{item.number}</span><strong>{item.label}</strong><small>{active === index ? "ACTIVE" : "SELECT"}</small><i className="stage-progress" />
            </button>
          ))}
        </div>
        <div className="system-exit"><span>{stage.number} / 04</span><a className="text-link" href="/technology">Explore the Complete Platform <Arrow /></a></div>
      </div>

      <audio ref={clickAudioRef} src="/audio/click.mp3" preload="auto" aria-hidden="true" />
      <audio ref={humAudioRef} src="/audio/machine-hum.mp3" preload="auto" loop aria-hidden="true" />
    </div>
  );
}
