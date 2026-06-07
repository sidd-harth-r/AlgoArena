import AiTutorPanel from "@/components/AiTutorPanel";
import CodeEditor from "@/components/Editor";
import ResultPanel from "@/components/ResultPanel";
import { fetchProblem } from "@/lib/api";

const diffBadge: Record<string, string> = {
  easy: "badge-easy",
  medium: "badge-medium",
  hard: "badge-hard"
};

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = await fetchProblem(slug);
  return (
    <main className="grid min-h-[calc(100vh-57px)] grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]" style={{ background: 'var(--bg-primary)' }}>
      {/* Left: Problem Statement */}
      <section className="overflow-y-auto p-6" style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="mb-5 flex items-center gap-3">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{problem.title}</h1>
          <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${diffBadge[problem.difficulty] ?? "badge-easy"}`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {problem.topic_tags.map((tag) => (
            <span key={tag} className="topic-tag">{tag}</span>
          ))}
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(34,211,238,0.2)' }}>
            Target: {problem.optimal_complexity}
          </span>
        </div>

        {/* Problem Statement */}
        <article className="problem-statement text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <ProblemMarkdown content={problem.statement_md} />
        </article>

        {/* Examples */}
        {problem.examples.length > 0 && (
          <div className="mt-8 space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Examples</h2>
            {problem.examples.map((example, i) => (
              <div key={example.display_order} className="rounded-lg p-4" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                <div className="mb-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Example {i + 1}</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>Input</div>
                    <pre className="mono rounded p-2 text-xs" style={{ background: 'var(--bg-primary)', color: 'var(--accent-cyan)' }}>{example.input}</pre>
                  </div>
                  <div>
                    <div className="mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>Expected</div>
                    <pre className="mono rounded p-2 text-xs" style={{ background: 'var(--bg-primary)', color: 'var(--accent-green)' }}>{example.expected}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Right: Editor + Results */}
      <ProblemWorkspace problemId={problem.id} />
    </main>
  );
}

function ProblemWorkspace({ problemId }: { problemId: number }) {
  return (
    <section className="grid min-h-[720px] grid-rows-[minmax(420px,1fr)_auto]" style={{ background: 'var(--bg-primary)' }}>
      <CodeEditor problemId={problemId} />
      <div className="grid border-t md:grid-cols-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <ResultPanel />
        <AiTutorPanel />
      </div>
    </section>
  );
}

/** Simple markdown-like renderer for problem statements */
function ProblemMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i}>{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i}>{line.slice(4)}</h3>);
    } else if (line.startsWith("- ")) {
      elements.push(<li key={i}>{renderInline(line.slice(2))}</li>);
    } else if (line.trim() === "") {
      continue;
    } else {
      elements.push(<p key={i}>{renderInline(line)}</p>);
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
      parts.push(<code key={key++}>{m.slice(1, -1)}</code>);
    } else if (m.startsWith("**")) {
      parts.push(<strong key={key++}>{m.slice(2, -2)}</strong>);
    }
    lastIdx = match.index + m.length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}
