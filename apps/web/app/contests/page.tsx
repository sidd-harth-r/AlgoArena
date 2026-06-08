"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const TOPIC_OPTIONS = [
  "Arrays", "Hash maps", "Two pointers", "Stack", "Binary search",
  "Sliding window", "Linked lists", "Trees", "Graphs", "Dynamic programming",
  "Greedy", "Intervals", "Bit manipulation", "Math", "Heap", "Tries", "Backtracking",
];

const DURATION_OPTIONS = [30, 60, 90, 120];

type ContestSummary = {
  contest_id: string;
  status: string;
  duration_minutes: number;
  topic_filter: string[];
  problem_ids: number[];
  started_at: string;
  ends_at: string;
  ended_at: string | null;
};

export default function ContestsPage() {
  const [contests, setContests] = useState<ContestSummary[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [duration, setDuration] = useState(60);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/contests/`)
      .then((r) => r.json())
      .then(setContests)
      .catch(() => {});
  }, []);

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const createContest = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/contests/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: selectedTopics, duration_minutes: duration }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Failed" }));
        throw new Error(err.detail);
      }
      const data = await res.json();
      window.location.href = `/contests/${data.contest_id}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create contest");
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-end justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Virtual Contests</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Practice under timed pressure. Pick topics and compete against the clock.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-5 py-2.5 text-sm"
            id="new-contest-btn"
          >
            + New Contest
          </button>
        </div>

        {/* Past Contests */}
        <div className="space-y-3 animate-fade-in animate-fade-in-delay-1">
          {contests.length === 0 && (
            <div className="glass-card p-10 text-center">
              <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No contests yet</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Create your first virtual contest to get started!</p>
            </div>
          )}
          {contests.map((c) => (
            <Link
              key={c.contest_id}
              href={c.status === "ACTIVE" ? `/contests/${c.contest_id}` : `/contests/${c.contest_id}/results`}
              className="glass-card group flex items-center justify-between p-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      background: c.status === "ACTIVE" ? 'rgba(26,122,74,0.08)' : 'rgba(142,139,135,0.08)',
                      color: c.status === "ACTIVE" ? 'var(--accent-green)' : 'var(--text-muted)',
                      border: `1px solid ${c.status === "ACTIVE" ? 'rgba(26,122,74,0.18)' : 'rgba(142,139,135,0.18)'}`,
                    }}
                  >
                    {c.status}
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {c.duration_minutes} min • {c.problem_ids.length} problems
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(c.started_at).toLocaleDateString()} {new Date(c.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {c.topic_filter.length > 0 && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      • {c.topic_filter.join(", ")}
                    </span>
                  )}
                </div>
              </div>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* New Contest Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-lg animate-fade-in rounded-2xl p-6"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-5 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>New Virtual Contest</h2>

            {/* Duration */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Duration</label>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className="rounded-lg px-4 py-2 text-sm font-medium transition-all"
                    style={{
                      background: duration === d ? 'var(--accent-flame)' : 'var(--bg-secondary)',
                      color: duration === d ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${duration === d ? 'var(--accent-flame)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Topics <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(leave empty for all)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTopic(t)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                    style={{
                      background: selectedTopics.includes(t) ? 'rgba(250,93,0,0.1)' : 'var(--bg-secondary)',
                      color: selectedTopics.includes(t) ? 'var(--accent-flame)' : 'var(--text-secondary)',
                      border: `1px solid ${selectedTopics.includes(t) ? 'rgba(250,93,0,0.3)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg p-3 text-xs" style={{ background: 'rgba(155,32,32,0.06)', color: 'var(--accent-rose)', border: '1px solid rgba(155,32,32,0.12)' }}>
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-ghost px-4 py-2 text-sm">Cancel</button>
              <button onClick={createContest} disabled={creating} className="btn-primary px-5 py-2 text-sm" id="start-contest-btn">
                {creating ? "Creating..." : "Start Contest"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
