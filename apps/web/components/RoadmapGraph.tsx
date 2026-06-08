"use client";

import { useState } from "react";
import Link from "next/link";

type RoadmapProblem = {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  solved: boolean;
};

type RoadmapNode = {
  id: string;
  label: string;
  prereqs: string[];
  problems: RoadmapProblem[];
  total: number;
  solved: number;
};

// ── Grid positions for the 18 nodes (col, row) ──────────────────────────── #
const NODE_POSITIONS: Record<string, { col: number; row: number }> = {
  "arrays":         { col: 3, row: 0 },
  "two-pointers":   { col: 0, row: 1 },
  "stack":          { col: 1, row: 1 },
  "binary-search":  { col: 2, row: 1 },
  "sliding-window": { col: 3, row: 1 },
  "linked-list":    { col: 4, row: 1 },
  "greedy":         { col: 5, row: 1 },
  "intervals":      { col: 6, row: 1 },
  "dp-1d":          { col: 0, row: 2 },
  "bit-manip":      { col: 5, row: 2 },
  "math":           { col: 6, row: 2 },
  "trees":          { col: 4, row: 2 },
  "dp-2d":          { col: 0, row: 3 },
  "tries":          { col: 3, row: 3 },
  "heap":           { col: 4, row: 3 },
  "graphs":         { col: 5, row: 3 },
  "backtracking":   { col: 6, row: 3 },
  "adv-graphs":     { col: 5, row: 4 },
};

const NODE_W = 180;
const NODE_H = 80;
const GAP_X = 200;
const GAP_Y = 120;
const PAD = 40;

function nodeCenter(id: string) {
  const pos = NODE_POSITIONS[id] ?? { col: 0, row: 0 };
  return {
    x: PAD + pos.col * GAP_X + NODE_W / 2,
    y: PAD + pos.row * GAP_Y + NODE_H / 2,
  };
}

export default function RoadmapGraph({ nodes }: { nodes: RoadmapNode[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedNode = nodes.find((n) => n.id === selected);

  // Build solved-all map for prerequisite locking
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const isUnlocked = (nodeId: string): boolean => {
    const n = nodeMap[nodeId];
    if (!n) return false;
    if (n.prereqs.length === 0) return true;
    return n.prereqs.every((pid) => {
      const pn = nodeMap[pid];
      return pn && pn.total > 0 && pn.solved > 0; // At least 1 solved in prereq
    });
  };

  // Calculate SVG dimensions
  const maxCol = Math.max(...Object.values(NODE_POSITIONS).map((p) => p.col));
  const maxRow = Math.max(...Object.values(NODE_POSITIONS).map((p) => p.row));
  const svgW = PAD * 2 + maxCol * GAP_X + NODE_W;
  const svgH = PAD * 2 + maxRow * GAP_Y + NODE_H;

  return (
    <div className="flex gap-6">
      {/* Graph */}
      <div className="flex-1 overflow-auto rounded-xl p-2" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', minHeight: 500 }}>
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block' }}>
          {/* Edges */}
          {nodes.flatMap((node) =>
            node.prereqs.map((prereqId) => {
              const from = nodeCenter(prereqId);
              const to = nodeCenter(node.id);
              return (
                <line
                  key={`${prereqId}-${node.id}`}
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke={isUnlocked(node.id) ? "rgba(250,93,0,0.3)" : "rgba(192,187,182,0.25)"}
                  strokeWidth="2"
                  strokeDasharray={isUnlocked(node.id) ? "" : "6 4"}
                />
              );
            })
          )}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = NODE_POSITIONS[node.id] ?? { col: 0, row: 0 };
            const x = PAD + pos.col * GAP_X;
            const y = PAD + pos.row * GAP_Y;
            const unlocked = isUnlocked(node.id);
            const allSolved = node.total > 0 && node.solved >= node.total;
            const someSolved = node.solved > 0 && !allSolved;
            const isSelected = selected === node.id;

            let fillColor = "#FFFFFF";
            let borderColor = "rgba(192,187,182,0.5)";
            let textColor = "#1D1E1C";

            if (!unlocked) {
              fillColor = "#F5EDE0";
              borderColor = "rgba(192,187,182,0.3)";
              textColor = "#8E8B87";
            } else if (allSolved) {
              fillColor = "#FFF4EC";
              borderColor = "#FA5D00";
            } else if (someSolved) {
              fillColor = "#FFF8F1";
              borderColor = "rgba(139,94,0,0.4)";
            }

            if (isSelected) {
              borderColor = "#FA5D00";
            }

            const progress = node.total > 0 ? node.solved / node.total : 0;

            return (
              <g
                key={node.id}
                onClick={() => setSelected(isSelected ? null : node.id)}
                className="cursor-pointer"
              >
                <rect
                  x={x} y={y}
                  width={NODE_W} height={NODE_H}
                  rx={12}
                  fill={fillColor}
                  stroke={borderColor}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  filter={isSelected ? "drop-shadow(0 2px 8px rgba(250,93,0,0.15))" : ""}
                />
                {/* Lock icon for locked nodes */}
                {!unlocked && (
                  <text x={x + NODE_W - 16} y={y + 16} fontSize="10" fill="#8E8B87">🔒</text>
                )}
                {/* All-solved checkmark */}
                {allSolved && (
                  <text x={x + NODE_W - 18} y={y + 18} fontSize="12" fill="#1A7A4A">✓</text>
                )}
                {/* Label */}
                <text
                  x={x + NODE_W / 2} y={y + NODE_H / 2 - 8}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill={textColor}
                  fontFamily="'Inter', sans-serif"
                >
                  {node.label}
                </text>
                {/* Progress text */}
                <text
                  x={x + NODE_W / 2} y={y + NODE_H / 2 + 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#8E8B87"
                  fontFamily="'Inter', sans-serif"
                >
                  {node.solved}/{node.total} solved
                </text>
                {/* Mini progress bar */}
                <rect x={x + 20} y={y + NODE_H - 12} width={NODE_W - 40} height={4} rx={2} fill="rgba(192,187,182,0.2)" />
                {progress > 0 && (
                  <rect
                    x={x + 20} y={y + NODE_H - 12}
                    width={(NODE_W - 40) * progress}
                    height={4} rx={2}
                    fill={allSolved ? "#1A7A4A" : "#FA5D00"}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Side Panel */}
      {selectedNode && (
        <div
          className="w-80 shrink-0 animate-fade-in rounded-xl p-5"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {selectedNode.label}
            </h3>
            <button
              onClick={() => setSelected(null)}
              className="rounded-md p-1 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          </div>
          <div className="mb-4">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${selectedNode.total > 0 ? (selectedNode.solved / selectedNode.total) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              {selectedNode.solved} of {selectedNode.total} solved
            </p>
          </div>
          <div className="space-y-2">
            {selectedNode.problems.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No problems in this topic yet.</p>
            )}
            {selectedNode.problems.map((p) => (
              <Link
                key={p.id}
                href={`/problems/${p.slug}`}
                className="flex items-center gap-3 rounded-lg p-3 transition-all"
                style={{
                  background: p.solved ? 'rgba(26,122,74,0.04)' : 'var(--bg-card)',
                  border: `1px solid ${p.solved ? 'rgba(26,122,74,0.15)' : 'var(--border-subtle)'}`,
                }}
              >
                <span className="text-sm" style={{ color: p.solved ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                  {p.solved ? "✓" : "○"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {p.title}
                  </div>
                </div>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium badge-${p.difficulty}`}>
                  {p.difficulty}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
