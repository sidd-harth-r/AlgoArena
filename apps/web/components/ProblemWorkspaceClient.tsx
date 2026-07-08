"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { loader } from "@monaco-editor/react";
import { fetchSubmission, submitCode, type SubmissionResult } from "@/lib/api";
import ResultPanel from "@/components/ResultPanel";
import HintPanel from "@/components/HintPanel";
import MentorPanel from "@/components/MentorPanel";
import CodeTracer from "@/components/CodeTracer";

// Configure Monaco to load completely offline from the Next.js public directory
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

const DEFAULT_PYTHON_STUB = `import sys

def solve():
    data = sys.stdin.read().strip().splitlines()
    # Parse input and print the expected answer.
    print("")

if __name__ == "__main__":
    solve()
`;

type ModalType = "hints" | "mentor" | "tracer" | null;

export default function ProblemWorkspaceClient({ problemId }: { problemId: number }) {
  const [code, setCode] = useState(DEFAULT_PYTHON_STUB);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEditorMount = useCallback(() => {}, []);

  const submit = async () => {
    setLoading(true);
    setMessage("Submitting...");
    setProgress(10);
    window.dispatchEvent(new CustomEvent("algoarena:result", { detail: null }));
    try {
      const { submission_id } = await submitCode(problemId, code, "python");
      setMessage("Evaluating...");
      setProgress(30);
      let result: SubmissionResult | null = null;
      for (let retries = 0; retries < 20; retries += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        result = await fetchSubmission(submission_id);
        setMessage(result.status.replace(/_/g, " "));
        setProgress(30 + Math.min(retries * 4, 60));
        if (!["PENDING", "RUNNING"].includes(result.status)) break;
      }
      setProgress(100);
      setLastSubmissionId(submission_id);
      window.dispatchEvent(new CustomEvent("algoarena:result", { detail: result }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <section className="flex flex-col min-h-[720px]" style={{ background: 'var(--bg-primary)' }}>
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-md px-3 py-1.5" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent-flame)' }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="mono text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Python 3</span>
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1 opacity-50"></div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveModal(activeModal === "hints" ? null : "hints")}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: activeModal === "hints" ? 'rgba(250,93,0,0.08)' : 'transparent',
                color: activeModal === "hints" ? 'var(--accent-flame)' : 'var(--text-muted)',
                border: activeModal === "hints" ? '1px solid rgba(250,93,0,0.18)' : '1px solid transparent',
              }}
            >
              💡 Hints
            </button>
            <button
              onClick={() => setActiveModal(activeModal === "mentor" ? null : "mentor")}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: activeModal === "mentor" ? 'rgba(250,93,0,0.08)' : 'transparent',
                color: activeModal === "mentor" ? 'var(--accent-flame)' : 'var(--text-muted)',
                border: activeModal === "mentor" ? '1px solid rgba(250,93,0,0.18)' : '1px solid transparent',
              }}
            >
              🤖 Mentor
            </button>
            <button
              onClick={() => setActiveModal(activeModal === "tracer" ? null : "tracer")}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: activeModal === "tracer" ? 'rgba(250,93,0,0.08)' : 'transparent',
                color: activeModal === "tracer" ? 'var(--accent-flame)' : 'var(--text-muted)',
                border: activeModal === "tracer" ? '1px solid rgba(250,93,0,0.18)' : '1px solid transparent',
              }}
            >
              🔍 Trace
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <span className="mono flex items-center gap-1.5 text-xs" style={{ color: loading ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
              {loading && <span className="inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent-amber)' }} />}
              {message}
            </span>
          )}
          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary flex items-center gap-2 text-xs"
            id="submit-code-btn"
          >
            {loading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Running
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z"/>
                </svg>
                Submit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <div className="progress-bar" style={{ height: '2px', borderRadius: 0 }}>
          <div className="progress-fill" style={{ width: `${progress}%`, transition: 'width 0.3s ease' }} />
        </div>
      )}

      {/* Editor & Overlay Container */}
      <div className="flex-1 relative flex flex-col" style={{ minHeight: 320 }}>
        {/* Floating Modal via Portal */}
        {activeModal && mounted && createPortal(
          <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 99999 }}>
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
              onClick={() => setActiveModal(null)}
            />
            {/* Modal */}
            <div 
              className="relative flex flex-col rounded-xl overflow-hidden animate-fade-in"
              style={{ 
                width: '100%', 
                maxWidth: '1100px',
                height: '85vh',
                maxHeight: '850px',
                background: 'var(--bg-primary)', 
                border: '1px solid var(--border-medium)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
              }}
            >
              <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                <span className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  {activeModal === "hints" && "💡 AI Hints"}
                  {activeModal === "mentor" && "🤖 Code Mentor"}
                  {activeModal === "tracer" && "🔍 Visual Tracer"}
                </span>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="flex items-center justify-center h-8 w-8 rounded-md transition-colors text-lg" 
                  style={{ color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  ✖
                </button>
              </div>
              <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
                {activeModal === "hints" && <HintPanel problemId={problemId} />}
                {activeModal === "mentor" && <MentorPanel submissionId={lastSubmissionId} />}
                {activeModal === "tracer" && <CodeTracer code={code} />}
              </div>
            </div>
          </div>,
          document.body
        )}

        <MonacoEditor
          height="100%"
          language="python"
          value={code}
          onChange={(value) => setCode(value ?? "")}
          theme="vs-dark"
          loading={
            <div className="flex h-full items-center justify-center" style={{ background: '#1e1e1e' }}>
              <div className="text-center">
                <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--accent-flame)', borderTopColor: 'transparent' }} />
                <p className="mono text-xs" style={{ color: '#888' }}>Initializing editor...</p>
              </div>
            </div>
          }
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            wordWrap: "on",
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            renderLineHighlight: "gutter",
            lineNumbers: "on",
            glyphMargin: false,
            folding: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      {/* Result Panel always at the bottom */}
      <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <ResultPanel />
      </div>
    </section>
  );
}
