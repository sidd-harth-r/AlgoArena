import TopicHeatmap from "@/components/TopicHeatmap";
import { fetchProblems } from "@/lib/api";

export const metadata = { title: "Dashboard — AlgoArena" };

export default async function DashboardPage() {
  const problems = await fetchProblems().catch(() => []);

  const easyCount = problems.filter((p) => p.difficulty === "easy").length;
  const mediumCount = problems.filter((p) => p.difficulty === "medium").length;
  const hardCount = problems.filter((p) => p.difficulty === "hard").length;
  const topics = new Set(problems.flatMap((p) => p.topic_tags));

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Track your progress across the AlgoArena problem set.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 animate-fade-in animate-fade-in-delay-1">
          <StatCard value={problems.length} label="Total Problems" icon="📋" gradient="from-blue-500/10 to-blue-600/5" />
          <StatCard value={easyCount} label="Easy" icon="🟢" gradient="from-green-500/10 to-green-600/5" />
          <StatCard value={mediumCount} label="Medium" icon="🟡" gradient="from-amber-500/10 to-amber-600/5" />
          <StatCard value={hardCount} label="Hard" icon="🔴" gradient="from-rose-500/10 to-rose-600/5" />
        </div>

        {/* Topic Distribution */}
        <div className="mb-4 animate-fade-in animate-fade-in-delay-2">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Topic Coverage</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            {topics.size} unique topics across the problem set
          </p>
        </div>
        <div className="animate-fade-in animate-fade-in-delay-3">
          <TopicHeatmap problems={problems} />
        </div>
      </div>
    </main>
  );
}

function StatCard({ value, label, icon, gradient }: { value: number; label: string; icon: string; gradient: string }) {
  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}
