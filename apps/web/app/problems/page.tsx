import { fetchProblems } from "@/lib/api";
import ProblemCard from "@/components/ProblemCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchSolved(): Promise<number[]> {
  try {
    const res = await fetch(`${API_URL}/users/me/solved`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ProblemsPage() {
  const [problems, solvedIds] = await Promise.all([
    fetchProblems().catch(() => []),
    fetchSolved(),
  ]);
  const solvedSet = new Set(solvedIds);

  // Extract unique topics
  const allTopics = [...new Set(problems.flatMap((p) => p.topic_tags))].sort();

  // Per-difficulty stats
  const stats = {
    total: problems.length,
    solved: solvedIds.length,
    easy: problems.filter((p) => p.difficulty === "easy").length,
    medium: problems.filter((p) => p.difficulty === "medium").length,
    hard: problems.filter((p) => p.difficulty === "hard").length,
    easySolved: problems.filter((p) => p.difficulty === "easy" && solvedSet.has(p.id)).length,
    mediumSolved: problems.filter((p) => p.difficulty === "medium" && solvedSet.has(p.id)).length,
    hardSolved: problems.filter((p) => p.difficulty === "hard" && solvedSet.has(p.id)).length,
  };

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text">Problems</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {stats.total > 0
              ? `${stats.total} problems across ${allTopics.length} topics`
              : "Connecting to server..."}
          </p>
        </div>

        {problems.length === 0 && (
          <div className="glass-card mx-auto max-w-lg p-8 text-center animate-fade-in">
            <div className="mb-4 text-4xl">⚠️</div>
            <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Backend Unavailable</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Could not load problems. Make sure Docker containers and the FastAPI backend are running, then refresh.
            </p>
            <p className="mt-3 text-xs mono" style={{ color: 'var(--accent-flame)', opacity: 0.7 }}>
              Run: .\start-all.ps1
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="mb-6 grid gap-3 sm:grid-cols-4 animate-fade-in animate-fade-in-delay-1">
          <StatCard label="Total Progress" value={`${stats.solved}/${stats.total}`} progress={stats.total > 0 ? stats.solved / stats.total : 0} color="var(--accent-flame)" />
          <StatCard label="Easy" value={`${stats.easySolved}/${stats.easy}`} progress={stats.easy > 0 ? stats.easySolved / stats.easy : 0} color="var(--accent-green)" />
          <StatCard label="Medium" value={`${stats.mediumSolved}/${stats.medium}`} progress={stats.medium > 0 ? stats.mediumSolved / stats.medium : 0} color="var(--accent-amber)" />
          <StatCard label="Hard" value={`${stats.hardSolved}/${stats.hard}`} progress={stats.hard > 0 ? stats.hardSolved / stats.hard : 0} color="var(--accent-rose)" />
        </div>

        {/* Topic Chips */}
        <div className="mb-6 flex flex-wrap gap-2 animate-fade-in animate-fade-in-delay-2">
          {allTopics.map((topic) => {
            const count = problems.filter((p) => p.topic_tags.includes(topic)).length;
            const solved = problems.filter((p) => p.topic_tags.includes(topic) && solvedSet.has(p.id)).length;
            return (
              <span key={topic} className="topic-tag" title={`${solved}/${count} solved`}>
                {topic} ({solved}/{count})
              </span>
            );
          })}
        </div>

        {/* Problem Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-fade-in animate-fade-in-delay-3">
          {problems.map((problem) => (
            <ProblemCard key={problem.slug} problem={problem} solved={solvedSet.has(problem.id)} />
          ))}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, progress, color }: { label: string; value: string; progress: number; color: string }) {
  return (
    <div className="glass-card p-4">
      <div className="mb-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="mb-2 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="progress-bar">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${progress * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}
