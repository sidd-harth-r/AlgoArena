"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { fetchSubmission, submitCode, type SubmissionResult } from "@/lib/api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ background: '#1e1e1e' }}>
      <div className="text-center">
        <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--accent-flame)', borderTopColor: 'transparent' }} />
        <p className="mono text-xs" style={{ color: '#888' }}>Loading editor...</p>
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

export default function CodeEditor({ problemId }: { problemId: number }) {
  const [code, setCode] = useState(DEFAULT_PYTHON_STUB);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [editorReady, setEditorReady] = useState(false);

  const handleEditorMount = useCallback(() => {
    setEditorReady(true);
  }, []);

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
      window.dispatchEvent(new CustomEvent("algoarena:result", { detail: result }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="flex h-full min-h-[420px] flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-md px-3 py-1.5" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent-flame)' }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="mono text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Python 3</span>
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

      {/* Monaco Editor */}
      <div className="flex-1">
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
    </div>
  );
}
