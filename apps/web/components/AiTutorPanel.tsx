"use client";

import { useEffect, useRef, useState } from "react";
import { hintUrl, type SubmissionResult } from "@/lib/api";

const MAX_HINTS = 3;

export default function AiTutorPanel() {
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const onResult = (event: Event) => {
      setResult((event as CustomEvent).detail);
      setHint("");
    };
    window.addEventListener("algoarena:result", onResult);
    return () => {
      abortRef.current?.abort();
      window.removeEventListener("algoarena:result", onResult);
    };
  }, []);

  const fetchHint = async () => {
    if (!result?.id || used >= MAX_HINTS) return;
    setLoading(true);
    setHint("");
    abortRef.current = new AbortController();
    try {
      const res = await fetch(hintUrl(result.id), { signal: abortRef.current.signal });
      if (!res.body) throw new Error("No hint stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const text = line.slice(6);
          if (text === "[DONE]") break;
          setHint((prev) => prev + text);
        }
      }
      setUsed((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  if (result?.is_optimal) {
    return (
      <div className="flex items-center gap-3 p-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent-green)' }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--accent-green)' }}>Optimal Solution!</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>No hints needed — your complexity matches the target.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent-purple)' }}>
              <path d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Tutor</span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_HINTS }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-4 rounded-full transition-all"
              style={{
                background: i < used ? 'var(--accent-purple)' : 'var(--bg-tertiary)',
                border: `1px solid ${i < used ? 'var(--accent-purple)' : 'var(--border-subtle)'}`,
              }}
            />
          ))}
          <span className="ml-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>{used}/{MAX_HINTS}</span>
        </div>
      </div>

      {/* Hint Content */}
      {hint && (
        <div className="animate-fade-in rounded-lg p-4" style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(167,139,250,0.15)' }}>
          <div className={`text-sm leading-relaxed ${loading ? 'typing-cursor' : ''}`} style={{ color: 'var(--text-secondary)' }}>
            {hint}
          </div>
        </div>
      )}

      {/* Hint Button */}
      <button
        onClick={fetchHint}
        disabled={!result?.id || loading || used >= MAX_HINTS}
        className="btn-ghost flex items-center gap-2 text-xs"
        id="get-hint-btn"
        style={used < MAX_HINTS && result?.id && !loading ? { borderColor: 'rgba(167,139,250,0.3)', color: 'var(--accent-purple)' } : {}}
      >
        {loading ? (
          <>
            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Thinking...
          </>
        ) : used >= MAX_HINTS ? (
          "Hint limit reached"
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            Get a hint
          </>
        )}
      </button>
    </div>
  );
}
