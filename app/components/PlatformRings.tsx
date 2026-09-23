"use client";

import { useState, useRef, MouseEvent, TouchEvent, KeyboardEvent } from "react";

export default function PlatformRings() {
  const [isLocked, setIsLocked] = useState(true);
  const [isInitialPulse, setIsInitialPulse] = useState(false);
  
  const [innerActive, setInnerActive] = useState(false);
  const [midActive, setMidActive] = useState(false);
  const [outActive, setOutActive] = useState(false);

  const innerTimer = useRef<NodeJS.Timeout | null>(null);
  const midTimer = useRef<NodeJS.Timeout | null>(null);
  const outTimer = useRef<NodeJS.Timeout | null>(null);

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
    if (isInitialPulse) return;

    if (isLocked) {
      setIsInitialPulse(true);
      triggerRing('all');
      setTimeout(() => {
        setIsInitialPulse(false);
        setIsLocked(false);
      }, 1000);
      return;
    }

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
    if (isLocked && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      if (!isInitialPulse) {
        setIsInitialPulse(true);
        triggerRing('all');
        setTimeout(() => {
          setIsInitialPulse(false);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div 
      className="platform-rings"
      aria-label="Platform activation graphic"
      role={isLocked ? "button" : "presentation"}
      tabIndex={isLocked ? 0 : -1}
      onClick={handlePointer}
      onKeyDown={handleKeyDown}
    >
      <i className={innerActive ? 'is-active inner' : 'inner'} aria-hidden="true" />
      <i className={midActive ? 'is-active mid' : 'mid'} aria-hidden="true" />
      <i className={outActive ? 'is-active out' : 'out'} aria-hidden="true" />

      {!isLocked && (
        <div className="sr-only">
          <button onClick={(e) => { e.stopPropagation(); triggerRing('inner'); }}>Activate inner ring</button>
          <button onClick={(e) => { e.stopPropagation(); triggerRing('mid'); }}>Activate middle ring</button>
          <button onClick={(e) => { e.stopPropagation(); triggerRing('out'); }}>Activate outer ring</button>
        </div>
      )}
    </div>
  );
}
