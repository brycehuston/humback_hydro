"use client";

import { useEffect, useState, useRef, MouseEvent, TouchEvent, KeyboardEvent } from "react";

export default function PlatformRings() {
  const [isReady, setIsReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  
  const [innerActive, setInnerActive] = useState(false);
  const [midActive, setMidActive] = useState(false);
  const [outActive, setOutActive] = useState(false);

  const innerTimer = useRef<NodeJS.Timeout | null>(null);
  const midTimer = useRef<NodeJS.Timeout | null>(null);
  const outTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const getReveal = () => root.getAnimations().find(
      (animation) => animation instanceof CSSAnimation && animation.animationName === "arc-layer-fill",
    );

    const unlock = () => {
      window.cancelAnimationFrame(frame);
      setIsReady(true);
    };

    const watchRevealCompletion = () => {
      const reveal = getReveal();

      if (!reveal) {
        return;
      }

      const effect = reveal.effect as KeyframeEffect | null;
      const timing = effect?.getComputedTiming();
      const completionOffset = effect
        ?.getKeyframes()
        .map((keyframe) => keyframe.computedOffset)
        .filter((offset): offset is number => offset !== null && offset < 1)
        .at(-1);

      if (
        timing?.currentIteration !== null
        && timing?.currentIteration !== undefined
        && timing.currentIteration > 0
        || (
          timing?.progress !== null
          && timing?.progress !== undefined
          && completionOffset !== undefined
          && timing.progress >= completionOffset
        )
      ) {
        unlock();
        return;
      }

      frame = window.requestAnimationFrame(watchRevealCompletion);
    };

    const handleAnimationStart = (event: AnimationEvent) => {
      if (event.target === root && event.animationName === "arc-layer-fill") {
        watchRevealCompletion();
      }
    };

    const syncMotionPreference = () => {
      if (motionQuery.matches) unlock();
      else {
        const reveal = getReveal();
        const progress = reveal?.effect?.getComputedTiming().progress;
        if (progress !== null && progress !== undefined) watchRevealCompletion();
      }
    };

    root.addEventListener("animationstart", handleAnimationStart);
    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    return () => {
      window.cancelAnimationFrame(frame);
      root.removeEventListener("animationstart", handleAnimationStart);
      motionQuery.removeEventListener("change", syncMotionPreference);
    };
  }, []);

  const triggerRing = (ring: 'inner' | 'mid' | 'out' | 'all') => {
    if ((ring === 'all' || ring === 'inner') && !innerTimer.current) {
      setInnerActive(true);
      innerTimer.current = setTimeout(() => {
        setInnerActive(false);
        innerTimer.current = null;
      }, 850);
    }
    if ((ring === 'all' || ring === 'mid') && !midTimer.current) {
      setMidActive(true);
      midTimer.current = setTimeout(() => {
        setMidActive(false);
        midTimer.current = null;
      }, 850);
    }
    if ((ring === 'all' || ring === 'out') && !outTimer.current) {
      setOutActive(true);
      outTimer.current = setTimeout(() => {
        setOutActive(false);
        outTimer.current = null;
      }, 850);
    }
  };

  const handlePointer = (e: MouseEvent | TouchEvent) => {
    if (!isReady) return;

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    const cx = rect.left + 310;
    const cy = rect.top + 310;
    const d = Math.sqrt(Math.pow(clientX - cx, 2) + Math.pow(clientY - cy, 2));

    if (d <= 310) {
      triggerRing('inner');
    } else if (d <= 410) {
      triggerRing('mid');
    } else if (d <= 520) {
      triggerRing('out');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isReady && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
    }
  };

  return (
    <div 
      ref={rootRef}
      className="platform-rings"
      aria-label="Platform activation graphic"
      aria-disabled={!isReady || undefined}
      data-interaction-ready={isReady ? "true" : "false"}
      role={isReady ? "presentation" : "button"}
      tabIndex={-1}
      onClick={handlePointer}
      onKeyDown={handleKeyDown}
    >
      <i className={innerActive ? 'is-active inner' : 'inner'} aria-hidden="true" />
      <i className={midActive ? 'is-active mid' : 'mid'} aria-hidden="true" />
      <i className={outActive ? 'is-active out' : 'out'} aria-hidden="true" />

      {isReady && (
        <div className="sr-only">
          <button onClick={(e) => { e.stopPropagation(); triggerRing('inner'); }}>Activate inner ring</button>
          <button onClick={(e) => { e.stopPropagation(); triggerRing('mid'); }}>Activate middle ring</button>
          <button onClick={(e) => { e.stopPropagation(); triggerRing('out'); }}>Activate outer ring</button>
        </div>
      )}
    </div>
  );
}
