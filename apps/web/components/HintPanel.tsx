"use client";

import { useState } from "react";
import { fetchHint } from "@/lib/api";

const MAX_HINTS = 3;

const hintLabels = [
  { level: 1, title: "Broad Nudge", description: "A general question about your approach" },
  { level: 2, title: "Structural Insight", description: "Points toward the key optimization" },
  { level: 3, title: "Pointed Question", description: "The most specific hint available" },
];

export default function HintPanel({ problemId }: { problemId: number }) {
  const [hints, setHints] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const revealHint = async (level: number) => {
    if (loading) return;
    // Already fetched — just toggle
    if (hints[level]) {
      setExpanded(expanded === level ? null : level);
      return;
    }

    setLoading(level);
    setError(null);
    try {
      const result = await fetchHint(problemId, level);
      setHints((prev) => ({ ...prev, [level]: result.text }));
      setRevealed(Math.max(revealed, result.hints_revealed));
      setExpanded(level);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch hint");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3 p-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: 'rgba(250,93,0,0.07)', border: '1px solid rgba(250,93,0,0.15)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent-flame)' }}>
            <path d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Hints</span>
        <div className="ml-auto flex items-center gap-1">
          {Array.from({ length: MAX_HINTS }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-4 rounded-full transition-all"
              style={{
                background: i < revealed ? 'var(--accent-flame)' : 'var(--bg-secondary)',
                border: `1px solid ${i < revealed ? 'var(--accent-flame)' : 'var(--border-subtle)'}`,
              }}
            />
          ))}
          <span className="ml-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>{revealed}/{MAX_HINTS}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg p-3 text-xs" style={{ background: 'rgba(155,32,32,0.06)', color: 'var(--accent-rose)', border: '1px solid rgba(155,32,32,0.12)' }}>
          {error}
        </div>
      )}

      {/* Hint Cards */}
      {hintLabels.map(({ level, title, description }) => {
        const isRevealed = !!hints[level];
        const isLocked = level > revealed + 1;
        const isLoading = loading === level;
        const isExpanded = expanded === level;

        return (
          <div key={level} className={`hint-card ${isRevealed ? 'hint-card-revealed' : ''}`}>
            <button
              onClick={() => revealHint(level)}
              disabled={isLocked || isLoading}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              id={`hint-btn-${level}`}
            >
              {/* Icon */}
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{
                  background: isRevealed
                    ? 'rgba(250,93,0,0.1)'
                    : isLocked
                    ? 'var(--bg-secondary)'
                    : 'rgba(250,93,0,0.06)',
                  color: isRevealed
                    ? 'var(--accent-flame)'
                    : isLocked
                    ? 'var(--text-muted)'
                    : 'var(--accent-flame)',
                  border: `1px solid ${isRevealed ? 'rgba(250,93,0,0.2)' : 'var(--border-subtle)'}`,
                }}
              >
                {isLocked ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                ) : (
                  level
                )}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold" style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {title}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{description}</div>
              </div>

              {/* Action */}
              {isLoading ? (
                <svg className="h-4 w-4 animate-spin shrink-0" style={{ color: 'var(--accent-flame)' }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              ) : isRevealed ? (
                <svg
                  className="h-4 w-4 shrink-0 transition-transform"
                  style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              ) : !isLocked ? (
                <span className="shrink-0 text-xs font-medium" style={{ color: 'var(--accent-flame)' }}>Reveal</span>
              ) : null}
            </button>

            {/* Hint Content */}
            {isRevealed && isExpanded && (
              <div className="animate-fade-in border-t px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {hints[level]}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
