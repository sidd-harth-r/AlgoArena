"use client";

import { useState } from "react";
import { traceCode, type RecursionTreeNode, type LoopTraceStep, type TraceResult } from "@/lib/api";
import SvgTreeViewer from "@/components/SvgTreeViewer";

type Props = {
  code: string;
};

export default function CodeTracer({ code }: Props) {
  const [result, setResult] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"tree" | "loop">("tree");
  const [stdinInput, setStdinInput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const runTrace = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep(0);
    setIsPlaying(false);
    try {
      const data = await traceCode(code, stdinInput);
      if (data.status === "error") {
        setError(data.detail?.message || "Tracing failed");
      }
      setResult(data);
      // Auto-select view based on what's available
      if (data.recursion_tree && data.recursion_tree.children && data.recursion_tree.children.length > 0) {
        setView("tree");
      } else if (data.loop_trace && data.loop_trace.length > 0) {
        setView("loop");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tracing failed");
    } finally {
      setLoading(false);
    }
  };

  // Auto-play for loop trace
  const togglePlay = () => {
    if (!result?.loop_trace?.length) return;
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    let step = currentStep;
    const interval = setInterval(() => {
      step++;
      if (step >= (result?.loop_trace?.length || 0)) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }
      setCurrentStep(step);
    }, 400);
    // Store interval for cleanup
    return () => clearInterval(interval);
  };

  const hasTree = result?.recursion_tree && result.recursion_tree.children && result.recursion_tree.children.length > 0;
  const hasLoop = result?.loop_trace && result.loop_trace.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-secondary)" }}>
        <input
          type="text"
          value={stdinInput}
          onChange={(e) => setStdinInput(e.target.value)}
          placeholder="stdin (optional)"
          className="mono flex-1 rounded-md px-2 py-1.5 text-xs outline-none"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", maxWidth: 200 }}
        />
        <button
          onClick={runTrace}
          disabled={loading || !code.trim()}
          className="btn-primary flex items-center gap-1.5 text-xs"
          style={{ padding: "0.35rem 0.75rem" }}
        >
          {loading ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Tracing...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Trace
            </>
          )}
        </button>

        {result && (hasTree || hasLoop) && (
          <div className="flex items-center gap-1 ml-auto">
            {hasTree && (
              <button
                onClick={() => setView("tree")}
                className="rounded-md px-2.5 py-1 text-xs font-medium transition-all"
                style={{
                  background: view === "tree" ? "rgba(250,93,0,0.1)" : "transparent",
                  color: view === "tree" ? "var(--accent-flame)" : "var(--text-muted)",
                  border: view === "tree" ? "1px solid rgba(250,93,0,0.2)" : "1px solid transparent",
                }}
              >
                🌳 Tree
              </button>
            )}
            {hasLoop && (
              <button
                onClick={() => setView("loop")}
                className="rounded-md px-2.5 py-1 text-xs font-medium transition-all"
                style={{
                  background: view === "loop" ? "rgba(250,93,0,0.1)" : "transparent",
                  color: view === "loop" ? "var(--accent-flame)" : "var(--text-muted)",
                  border: view === "loop" ? "1px solid rgba(250,93,0,0.2)" : "1px solid transparent",
                }}
              >
                🔄 Steps
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3" style={{ minHeight: 0 }}>
        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(250,93,0,0.08)", border: "1px solid rgba(250,93,0,0.15)" }}>
              <span style={{ fontSize: 20 }}>🔍</span>
            </div>
            <span className="text-xs text-center" style={{ color: "var(--text-muted)", maxWidth: 240 }}>
              Click &ldquo;Trace&rdquo; to visualize your code execution — see recursion trees and variable states at each step.
            </span>
          </div>
        )}

        {error && (
          <div className="rounded-lg p-3" style={{ background: "rgba(155,32,32,0.06)", border: "1px solid rgba(155,32,32,0.15)" }}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: "var(--accent-rose)" }}>⚠️</span>
              <span className="text-xs font-semibold" style={{ color: "var(--accent-rose)" }}>Trace Error</span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{error}</p>
          </div>
        )}

        {result && view === "tree" && hasTree && (
          <div className="space-y-1 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Recursion Tree</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>({result.total_steps} events)</span>
            </div>
            <div className="flex-1 rounded-lg" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)", minHeight: 0 }}>
              <SvgTreeViewer data={result.recursion_tree!} />
            </div>
          </div>
        )}

        {result && view === "loop" && hasLoop && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Loop Trace</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Step {currentStep + 1} of {result.loop_trace.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="rounded px-2 py-0.5 text-xs"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", opacity: currentStep === 0 ? 0.4 : 1 }}
                >
                  ◀
                </button>
                <button
                  onClick={togglePlay}
                  className="rounded px-2 py-0.5 text-xs font-medium"
                  style={{
                    background: isPlaying ? "rgba(155,32,32,0.08)" : "rgba(250,93,0,0.08)",
                    color: isPlaying ? "var(--accent-rose)" : "var(--accent-flame)",
                    border: isPlaying ? "1px solid rgba(155,32,32,0.2)" : "1px solid rgba(250,93,0,0.2)",
                  }}
                >
                  {isPlaying ? "⏸ Pause" : "▶ Play"}
                </button>
                <button
                  onClick={() => setCurrentStep(Math.min(result.loop_trace.length - 1, currentStep + 1))}
                  disabled={currentStep >= result.loop_trace.length - 1}
                  className="rounded px-2 py-0.5 text-xs"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", opacity: currentStep >= result.loop_trace.length - 1 ? 0.4 : 1 }}
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={0}
              max={result.loop_trace.length - 1}
              value={currentStep}
              onChange={(e) => { setCurrentStep(Number(e.target.value)); setIsPlaying(false); }}
              className="w-full"
              style={{ accentColor: "var(--accent-flame)" }}
            />

            {/* Current step details */}
            <LoopStepCard step={result.loop_trace[currentStep]} />
          </div>
        )}

        {result && !hasTree && !hasLoop && !error && (
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            <span style={{ fontSize: 28 }}>📭</span>
            <span className="text-xs text-center" style={{ color: "var(--text-muted)", maxWidth: 240 }}>
              No trace data. Your code may not have loops or recursive calls to trace.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Recursive tree node renderer */
function TreeNode({ node, depth }: { node: RecursionTreeNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 4);
  const hasChildren = node.children && node.children.length > 0;

  const depthColors = [
    "var(--accent-flame)", "var(--accent-blue)", "var(--accent-green)",
    "var(--accent-purple)", "var(--accent-amber)", "var(--accent-cyan)",
  ];
  const color = depthColors[depth % depthColors.length];

  const argsStr = Object.entries(node.args)
    .filter(([k]) => k !== "__builtins__")
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");

  return (
    <div style={{ marginLeft: depth > 0 ? 16 : 0 }}>
      <div
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs cursor-pointer transition-all"
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{
          background: `${color}08`,
          border: `1px solid ${color}20`,
          marginBottom: 2,
        }}
      >
        {hasChildren && (
          <span className="mono text-xs" style={{ color, width: 12, textAlign: "center", transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}>
            ▶
          </span>
        )}
        {!hasChildren && <span style={{ width: 12 }} />}

        <span className="mono font-semibold" style={{ color }}>
          {node.func}
        </span>
        <span className="mono" style={{ color: "var(--text-muted)" }}>
          ({argsStr})
        </span>
        {node.return_value !== null && (
          <span className="mono ml-auto" style={{ color: "var(--accent-green)" }}>
            → {node.return_value}
          </span>
        )}
        <span className="mono" style={{ color: "var(--text-muted)", fontSize: 10 }}>
          L{node.line}
        </span>
      </div>

      {expanded && hasChildren && (
        <div style={{ borderLeft: `2px solid ${color}20`, marginLeft: 6, paddingLeft: 4 }}>
          {node.children.map((child, idx) => (
            <TreeNode key={`${child.call_id}-${idx}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Loop step card showing variables at a specific step */
function LoopStepCard({ step }: { step: LoopTraceStep }) {
  if (!step) return null;

  return (
    <div className="rounded-lg p-3" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="mono text-xs font-semibold" style={{ color: "var(--accent-flame)" }}>
          {step.func}()
        </span>
        <span className="mono text-xs" style={{ color: "var(--text-muted)" }}>
          Line {step.line}
        </span>
      </div>

      {Object.keys(step.locals).length > 0 ? (
        <div className="grid gap-1">
          {Object.entries(step.locals).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 rounded px-2 py-1" style={{ background: "var(--bg-secondary)" }}>
              <span className="mono text-xs font-medium" style={{ color: "var(--accent-blue)", minWidth: 60 }}>
                {key}
              </span>
              <span className="mono text-xs" style={{ color: "var(--text-muted)" }}>=</span>
              <span className="mono text-xs" style={{ color: "var(--accent-green)" }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>No local variables at this step</span>
      )}
    </div>
  );
}
