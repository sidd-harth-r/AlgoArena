"use client";

import { useEffect, useState } from "react";

export default function ContestTimer({
  remainingSeconds,
  onExpired,
}: {
  remainingSeconds: number;
  onExpired: () => void;
}) {
  const [secs, setSecs] = useState(Math.max(0, remainingSeconds));

  useEffect(() => {
    if (secs <= 0) {
      onExpired();
      return;
    }
    const interval = setInterval(() => {
      setSecs((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const isUrgent = secs < 300; // last 5 minutes
  const isCritical = secs < 60;

  return (
    <div
      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 mono text-lg font-bold transition-colors"
      style={{
        background: isCritical
          ? 'rgba(155,32,32,0.08)'
          : isUrgent
          ? 'rgba(139,94,0,0.08)'
          : 'var(--bg-secondary)',
        color: isCritical
          ? 'var(--accent-rose)'
          : isUrgent
          ? 'var(--accent-amber)'
          : 'var(--text-primary)',
        border: `1px solid ${isCritical ? 'rgba(155,32,32,0.2)' : isUrgent ? 'rgba(139,94,0,0.2)' : 'var(--border-subtle)'}`,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      {mm}:{ss}
      {isCritical && <span className="animate-pulse-glow">⚠</span>}
    </div>
  );
}
