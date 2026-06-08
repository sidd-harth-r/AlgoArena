"use client";

import { useEffect, useState } from "react";
import type { SubmissionResult } from "@/lib/api";

const statusConfig: Record<string, { label: string; icon: string; colorVar: string }> = {
  ACCEPTED:              { label: "Accepted",              icon: "✓", colorVar: "var(--accent-green)" },
  WRONG_ANSWER:          { label: "Wrong Answer",          icon: "✗", colorVar: "var(--accent-rose)" },
  TIME_LIMIT_EXCEEDED:   { label: "Time Limit Exceeded",   icon: "⏱", colorVar: "var(--accent-amber)" },
  MEMORY_LIMIT_EXCEEDED: { label: "Memory Limit Exceeded", icon: "▪", colorVar: "var(--accent-amber)" },
  RUNTIME_ERROR:         { label: "Runtime Error",         icon: "⚠", colorVar: "var(--accent-rose)" },
  COMPILE_ERROR:         { label: "Compile Error",         icon: "⚠", colorVar: "var(--accent-orange)" },
  INTERNAL_ERROR:        { label: "Internal Error",        icon: "?", colorVar: "var(--text-muted)" },
};

export default function ResultPanel() {
  const [result, setResult] = useState<SubmissionResult | null>(null);

  useEffect(() => {
    const onResult = (event: Event) => setResult((event as CustomEvent).detail);
    window.addEventListener("algoarena:result", onResult);
    return () => window.removeEventListener("algoarena:result", onResult);
  }, []);

  if (!result) {
    return (
      <div className="flex items-center gap-3 p-5" style={{ borderRight: '1px solid var(--border-subtle)' }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-muted)' }}>
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Submit code to see results</span>
      </div>
    );
  }

  const cfg = statusConfig[result.status] ?? statusConfig.INTERNAL_ERROR;
  const passRatio = result.total_count > 0 ? (result.passed_count / result.total_count) * 100 : 0;

  return (
    <div className="animate-fade-in space-y-4 p-5" style={{ borderRight: '1px solid var(--border-subtle)' }}>
      {/* Status Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold" style={{ background: `${cfg.colorVar}15`, color: cfg.colorVar, border: `1px solid ${cfg.colorVar}30` }}>
          {cfg.icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold" style={{ color: cfg.colorVar }}>{cfg.label}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{result.passed_count}/{result.total_count} tests passed</div>
        </div>
      </div>

      {/* Test Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${passRatio}%`,
            background: result.status === "ACCEPTED"
              ? "var(--accent-green)"
              : `linear-gradient(90deg, var(--accent-green) 0%, ${cfg.colorVar} 100%)`
          }}
        />
      </div>

      {/* Complexity Comparison */}
      {result.user_complexity && (
        <div className="rounded-lg p-3" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
          <div className="mb-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Complexity Analysis</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>Your solution</div>
              <div className="mono text-sm font-bold" style={{ color: result.is_optimal ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                {result.user_complexity}
              </div>
            </div>
            <div>
              <div className="mb-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>Target</div>
              <div className="mono text-sm font-bold" style={{ color: 'var(--accent-flame)' }}>
                {result.optimal_complexity}
              </div>
            </div>
          </div>
          {result.is_optimal && result.status === "ACCEPTED" && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--accent-green)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Optimal complexity achieved!
            </div>
          )}
        </div>
      )}

      {/* Error Details */}
      {result.error_message && (
        <pre className="mono max-h-28 overflow-auto rounded-lg p-3 text-xs" style={{ background: 'var(--bg-secondary)', color: 'var(--accent-rose)', border: '1px solid rgba(155,32,32,0.15)' }}>
          {result.error_message}
        </pre>
      )}
    </div>
  );
}
