"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ProblemResult = {
  problem_id: number;
  title: string;
  difficulty: string;
  attempts: number;
  status: string;
  time_to_solve_seconds: number | null;
};

type ContestResults = {
  contest_id: string;
  status: string;
  duration_minutes: number;
  total_problems: number;
  total_solved: number;
  results: ProblemResult[];
};

const LABELS = ["A", "B", "C", "D", "E", "F"];

export default function ContestResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ContestResults | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/contests/${id}/results`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [id]);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="shimmer h-8 w-32 rounded-lg" />
      </main>
    );
  }

  const score = data.total_problems > 0 ? Math.round((data.total_solved / data.total_problems) * 100) : 0;

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 animate-fade-in text-center">
          <h1 className="text-3xl font-bold gradient-text">Contest Results</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {data.duration_minutes} minute contest • {data.status}
          </p>
        </div>

        {/* Score Card */}
        <div className="mb-8 glass-card animate-fade-in animate-fade-in-delay-1 p-8 text-center">
          <div className="mb-2 text-6xl font-extrabold gradient-text">{score}%</div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {data.total_solved} of {data.total_problems} problems solved
          </p>
          <div className="mx-auto mt-4 max-w-xs">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${score}%` }} />
            </div>
          </div>
        </div>

        {/* Problem Results */}
        <div className="space-y-3 animate-fade-in animate-fade-in-delay-2">
          {data.results.map((r, i) => (
            <div
              key={r.problem_id}
              className="glass-card flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                  style={{
                    background: r.status === "ACCEPTED"
                      ? 'rgba(26,122,74,0.08)'
                      : r.status === "ATTEMPTED"
                      ? 'rgba(155,32,32,0.08)'
                      : 'var(--bg-secondary)',
                    color: r.status === "ACCEPTED"
                      ? 'var(--accent-green)'
                      : r.status === "ATTEMPTED"
                      ? 'var(--accent-rose)'
                      : 'var(--text-muted)',
                    border: `1px solid ${
                      r.status === "ACCEPTED"
                        ? 'rgba(26,122,74,0.18)'
                        : r.status === "ATTEMPTED"
                        ? 'rgba(155,32,32,0.18)'
                        : 'var(--border-subtle)'
                    }`,
                  }}
                >
                  {r.status === "ACCEPTED" ? "✓" : r.status === "ATTEMPTED" ? "✗" : "—"}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {LABELS[i]}. {r.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium badge-${r.difficulty}`}>
                      {r.difficulty}
                    </span>
                    {r.attempts > 0 && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {r.attempts} attempt{r.attempts !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                {r.time_to_solve_seconds !== null ? (
                  <div className="mono text-sm font-medium" style={{ color: 'var(--accent-green)' }}>
                    {Math.floor(r.time_to_solve_seconds / 60)}:{String(r.time_to_solve_seconds % 60).padStart(2, "0")}
                  </div>
                ) : (
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {r.status === "NOT_ATTEMPTED" ? "Not attempted" : "Not solved"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4 animate-fade-in animate-fade-in-delay-3">
          <Link href="/contests" className="btn-ghost px-5 py-2.5 text-sm">
            Back to Contests
          </Link>
          <Link href="/contests" className="btn-primary px-5 py-2.5 text-sm">
            New Contest
          </Link>
        </div>
      </div>
    </main>
  );
}
