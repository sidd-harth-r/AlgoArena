"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ContestTimer from "@/components/ContestTimer";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ContestProblem = { id: number; title: string; slug: string; difficulty: string };
type ContestDetail = {
  contest_id: string;
  status: string;
  duration_minutes: number;
  remaining_seconds: number;
  problems: ContestProblem[];
};

const LABELS = ["A", "B", "C", "D", "E", "F"];

export default function ContestWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [contest, setContest] = useState<ContestDetail | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [codes, setCodes] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<Record<number, { status: string; passed: number; total: number }>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/contests/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "FINISHED") {
          router.push(`/contests/${id}/results`);
          return;
        }
        setContest(data);
      })
      .catch(() => setError("Failed to load contest"));
  }, [id, router]);

  const handleSubmit = async (problemId: number) => {
    const code = codes[problemId] || "";
    if (!code.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const subRes = await fetch(`${API_URL}/submissions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem_id: problemId, code, language: "python", contest_id: id }),
      });
      const subData = await subRes.json();
      // Poll for result
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const pollRes = await fetch(`${API_URL}/submissions/${subData.submission_id}`);
        const pollData = await pollRes.json();
        if (pollData.status !== "PENDING" && pollData.status !== "RUNNING") {
          setResults((prev) => ({
            ...prev,
            [problemId]: { status: pollData.status, passed: pollData.passed_count, total: pollData.total_count },
          }));
          break;
        }
      }
    } catch {
      setError("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpired = async () => {
    try {
      await fetch(`${API_URL}/contests/${id}/end`, { method: "POST" });
    } catch { /* ignore */ }
    router.push(`/contests/${id}/results`);
  };

  if (error && !contest) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--accent-rose)' }}>{error}</p>
      </main>
    );
  }

  if (!contest) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="shimmer h-8 w-32 rounded-lg" />
      </main>
    );
  }

  const currentProblem = contest.problems[activeTab];
  const currentResult = currentProblem ? results[currentProblem.id] : null;

  return (
    <main className="flex h-[calc(100vh-57px)] flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b px-4 py-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold gradient-text">Contest</span>
          <div className="flex gap-1">
            {contest.problems.map((p, i) => {
              const res = results[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(i)}
                  className="rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    background: activeTab === i
                      ? 'var(--accent-flame)'
                      : res?.status === "ACCEPTED"
                      ? 'rgba(26,122,74,0.1)'
                      : 'var(--bg-secondary)',
                    color: activeTab === i
                      ? 'white'
                      : res?.status === "ACCEPTED"
                      ? 'var(--accent-green)'
                      : 'var(--text-secondary)',
                    border: `1px solid ${
                      activeTab === i
                        ? 'var(--accent-flame)'
                        : res?.status === "ACCEPTED"
                        ? 'rgba(26,122,74,0.2)'
                        : 'var(--border-subtle)'
                    }`,
                  }}
                >
                  {LABELS[i]} {res?.status === "ACCEPTED" && "✓"}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ContestTimer remainingSeconds={contest.remaining_seconds} onExpired={handleExpired} />
          <button
            onClick={handleExpired}
            className="btn-ghost px-3 py-1.5 text-xs"
            style={{ color: 'var(--accent-rose)' }}
          >
            End Contest
          </button>
        </div>
      </div>

      {/* Workspace */}
      {currentProblem && (
        <div className="flex flex-1 overflow-hidden">
          {/* Problem Info */}
          <div className="w-80 shrink-0 overflow-y-auto border-r p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
            <h2 className="mb-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {LABELS[activeTab]}. {currentProblem.title}
            </h2>
            <span className={`rounded px-2 py-0.5 text-xs font-medium badge-${currentProblem.difficulty}`}>
              {currentProblem.difficulty}
            </span>

            {/* Result */}
            {currentResult && (
              <div
                className="mt-4 rounded-lg p-3"
                style={{
                  background: currentResult.status === "ACCEPTED" ? 'rgba(26,122,74,0.06)' : 'rgba(155,32,32,0.06)',
                  border: `1px solid ${currentResult.status === "ACCEPTED" ? 'rgba(26,122,74,0.15)' : 'rgba(155,32,32,0.15)'}`,
                }}
              >
                <div className="text-sm font-semibold" style={{ color: currentResult.status === "ACCEPTED" ? 'var(--accent-green)' : 'var(--accent-rose)' }}>
                  {currentResult.status.replace(/_/g, " ")}
                </div>
                <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {currentResult.passed}/{currentResult.total} test cases passed
                </div>
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="flex flex-1 flex-col">
            <div className="flex-1">
              <MonacoEditor
                height="100%"
                language="python"
                theme="vs-dark"
                value={codes[currentProblem.id] ?? `# Problem ${LABELS[activeTab]}: ${currentProblem.title}\n\ndef solution():\n    pass\n`}
                onChange={(val) => setCodes((prev) => ({ ...prev, [currentProblem.id]: val ?? "" }))}
                options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 } }}
              />
            </div>
            <div className="flex items-center justify-between border-t px-4 py-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
              {error && <span className="text-xs" style={{ color: 'var(--accent-rose)' }}>{error}</span>}
              <div className="ml-auto">
                <button
                  onClick={() => handleSubmit(currentProblem.id)}
                  disabled={submitting}
                  className="btn-primary px-5 py-2 text-sm"
                  id="contest-submit-btn"
                >
                  {submitting ? "Judging..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
