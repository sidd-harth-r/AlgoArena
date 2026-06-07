import { fetchProblems } from "@/lib/api";
import ProblemCard from "@/components/ProblemCard";
import Link from "next/link";

export default async function HomePage() {
  const problems = await fetchProblems().catch(() => []);
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 text-center">
        {/* Animated gradient background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(80px)' }} />
          <div className="absolute -right-32 top-20 h-80 w-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(80px)' }} />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', filter: 'blur(60px)' }} />
        </div>

        <div className="relative mx-auto max-w-4xl animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)' }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full animate-pulse-glow" style={{ background: 'var(--accent-green)' }} />
            Static Big-O Analysis + Socratic AI Hints
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            <span className="gradient-text">AlgoArena</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Practice algorithms, submit Python solutions, and receive{" "}
            <span style={{ color: 'var(--accent-cyan)' }}>static complexity feedback</span>{" "}
            from AST analysis — alongside{" "}
            <span style={{ color: 'var(--accent-purple)' }}>Socratic AI hints</span>{" "}
            that guide you to the optimal solution without spoiling it.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/problems" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm" id="hero-start-btn">
              <span>Start Solving</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/dashboard" className="btn-ghost inline-flex items-center gap-2 px-6 py-3 text-sm" id="hero-dashboard-btn">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon="⚡"
            title="Execution Feedback"
            description="Submit code and get pass/fail results per test case with runtime in ms and error details."
            color="var(--accent-blue)"
            delay="1"
          />
          <FeatureCard
            icon="🧬"
            title="Complexity Analysis"
            description="Static Big-O inference from your AST. Know your code's complexity class without benchmarks."
            color="var(--accent-purple)"
            delay="2"
          />
          <FeatureCard
            icon="🎓"
            title="Socratic AI Hints"
            description="The AI asks you the question that leads to the insight — never gives away the answer."
            color="var(--accent-cyan)"
            delay="3"
          />
        </div>
      </section>

      {/* Problem Showcase */}
      {problems.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Featured Problems</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                {problems.length} curated problems across arrays, graphs, DP, trees, and search.
              </p>
            </div>
            <Link href="/problems" className="text-sm font-medium transition-colors" style={{ color: 'var(--accent-blue)' }} id="view-all-problems">
              View all &rarr;
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {problems.slice(0, 6).map((problem) => (
              <ProblemCard key={problem.slug} problem={problem} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function FeatureCard({ icon, title, description, color, delay }: { icon: string; title: string; description: string; color: string; delay: string }) {
  return (
    <div className={`glass-card p-6 animate-fade-in animate-fade-in-delay-${delay}`}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-lg" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        {icon}
      </div>
      <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
    </div>
  );
}
