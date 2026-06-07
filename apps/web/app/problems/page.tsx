import ProblemCard from "@/components/ProblemCard";
import { fetchProblems } from "@/lib/api";

export const metadata = { title: "Problems — AlgoArena" };

export default async function ProblemsPage() {
  const problems = await fetchProblems();

  const easyCount = problems.filter(p => p.difficulty === "easy").length;
  const mediumCount = problems.filter(p => p.difficulty === "medium").length;
  const hardCount = problems.filter(p => p.difficulty === "hard").length;

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Problem Set</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {problems.length} curated problems across arrays, graphs, DP, trees, and search.
          </p>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-3 gap-3 animate-fade-in animate-fade-in-delay-1">
          <StatCard label="Easy" count={easyCount} color="var(--accent-green)" />
          <StatCard label="Medium" count={mediumCount} color="var(--accent-amber)" />
          <StatCard label="Hard" count={hardCount} color="var(--accent-rose)" />
        </div>

        {/* Problem Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-fade-in animate-fade-in-delay-2">
          {problems.map((problem) => (
            <ProblemCard key={problem.slug} problem={problem} />
          ))}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="glass-card flex items-center gap-3 p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
        {count}
      </div>
      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}
