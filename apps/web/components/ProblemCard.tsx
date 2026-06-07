import Link from "next/link";
import type { ProblemSummary } from "@/lib/api";

const difficultyStyles: Record<string, string> = {
  easy: "badge-easy",
  medium: "badge-medium",
  hard: "badge-hard"
};

export default function ProblemCard({ problem }: { problem: ProblemSummary }) {
  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="glass-card group block p-5"
      id={`problem-card-${problem.slug}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold transition-colors group-hover:text-blue-400" style={{ color: 'var(--text-primary)' }}>
            {problem.title}
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {problem.topic_tags.slice(0, 3).map((tag) => (
              <span key={tag} className="topic-tag">{tag}</span>
            ))}
          </div>
        </div>
        <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${difficultyStyles[problem.difficulty] ?? "badge-easy"}`}>
          {problem.difficulty}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="mono text-xs font-medium" style={{ color: 'var(--accent-cyan)', opacity: 0.8 }}>
          Target: {problem.optimal_complexity}
        </span>
        <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 16 16">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Link>
  );
}
