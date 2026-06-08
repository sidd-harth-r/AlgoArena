import type { ProblemSummary } from "@/lib/api";

const heatColors = [
  "rgba(250,93,0,0.08)",
  "rgba(250,93,0,0.15)",
  "rgba(250,93,0,0.25)",
  "rgba(250,93,0,0.4)",
  "rgba(250,93,0,0.6)",
  "rgba(250,93,0,0.8)",
];

export default function TopicHeatmap({ problems }: { problems: ProblemSummary[] }) {
  const counts = new Map<string, number>();
  for (const problem of problems) {
    for (const tag of problem.topic_tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  const topics = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...topics.map(([, c]) => c), 1);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {topics.map(([topic, count]) => {
        const intensity = Math.min(Math.floor((count / maxCount) * (heatColors.length - 1)), heatColors.length - 1);
        return (
          <div
            key={topic}
            className="heatmap-cell glass-card p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{topic}</span>
              <span className="mono text-xs font-bold" style={{ color: 'var(--accent-flame)' }}>{count}</span>
            </div>
            <div className="progress-bar">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(count / maxCount) * 100}%`,
                  background: heatColors[intensity],
                }}
              />
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              {count} {count === 1 ? "problem" : "problems"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
