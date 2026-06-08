"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { loader } from "@monaco-editor/react";
import ContestTimer from "@/components/ContestTimer";

loader.config({ paths: { vs: "/monaco/vs" } });

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ background: '#1e1e1e' }}>
      <div className="text-center">
        <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--accent-flame)', borderTopColor: 'transparent' }} />
        <p className="mono text-xs" style={{ color: '#888' }}>Initializing editor locally...</p>
      </div>
    </div>
  ),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ContestProblem = {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  statement_md: string;
  examples: { input: string; expected: string; explanation?: string }[];
};
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
          <div className="w-[450px] shrink-0 overflow-y-auto border-r p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
            <h2 className="mb-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {LABELS[activeTab]}. {currentProblem.title}
            </h2>
            <span className={`rounded px-2 py-0.5 text-xs font-medium badge-${currentProblem.difficulty}`}>
              {currentProblem.difficulty}
            </span>

            <div className="mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <article className="problem-statement leading-relaxed">
                <ProblemMarkdown content={currentProblem.statement_md || ""} />
              </article>

              {currentProblem.examples?.length > 0 && (
                <div className="mt-8 space-y-3">
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Examples</h3>
                  <div className="flex flex-col gap-4">
                    {currentProblem.examples.map((ex, i) => (
                      <div key={i} className="rounded-lg p-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                        <div className="mb-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Example {i + 1}</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="mb-1 text-xs text-slate-500">Input</div>
                            <pre className="mono rounded p-2 text-xs" style={{ background: 'var(--code-bg)', color: 'var(--accent-flame)' }}>{ex.input}</pre>
                          </div>
                          <div>
                            <div className="mb-1 text-xs text-slate-500">Expected</div>
                            <pre className="mono rounded p-2 text-xs" style={{ background: 'var(--code-bg)', color: 'var(--accent-green)' }}>{ex.expected}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                value={codes[currentProblem.id] ?? `# Problem ${LABELS[activeTab]}: ${currentProblem.title}\nimport sys\n\ndef solve():\n    data = sys.stdin.read().strip().splitlines()\n    # Parse input and print the expected answer.\n    print("")\n\nif __name__ == "__main__":\n    solve()\n`}
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

/** Simple markdown-like renderer for problem statements */
function ProblemMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="mt-4 mb-2 font-bold" style={{ color: 'var(--text-primary)' }}>{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="mt-4 mb-2 font-bold" style={{ color: 'var(--text-primary)' }}>{line.slice(4)}</h3>);
    } else if (line.startsWith("- ")) {
      elements.push(<li key={i} className="ml-4 list-disc">{renderInline(line.slice(2))}</li>);
    } else if (line.trim() === "") {
      continue;
    } else {
      elements.push(<p key={i} className="mb-2">{renderInline(line)}</p>);
    }
  }
  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIdx = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    const m = match[0];
    if (m.startsWith("`")) {
      parts.push(<code key={key++} className="rounded px-1 py-0.5 bg-black/10 dark:bg-white/10 font-mono text-xs">{m.slice(1, -1)}</code>);
    } else if (m.startsWith("**")) {
      parts.push(<strong key={key++} className="font-bold">{m.slice(2, -2)}</strong>);
    }
    lastIdx = match.index + m.length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}

