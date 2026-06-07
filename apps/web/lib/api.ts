export type ProblemSummary = {
  id: number;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  topic_tags: string[];
  optimal_complexity: string;
};

export type ProblemDetail = ProblemSummary & {
  statement_md: string;
  editorial_md: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  examples: { input: string; expected: string; display_order: number }[];
};

export type SubmissionResult = {
  id: string;
  status: string;
  passed_count: number;
  total_count: number;
  runtime_ms?: number;
  memory_kb?: number;
  error_message?: string;
  failed_input?: string;
  expected_output?: string;
  actual_output?: string;
  user_complexity?: string;
  optimal_complexity?: string;
  is_optimal?: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchProblems(): Promise<ProblemSummary[]> {
  const res = await fetch(`${API_URL}/problems/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load problems");
  return res.json();
}

export async function fetchProblem(slug: string): Promise<ProblemDetail> {
  const res = await fetch(`${API_URL}/problems/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Problem not found");
  return res.json();
}

export async function submitCode(problemId: number, code: string, language = "python") {
  const res = await fetch(`${API_URL}/submissions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem_id: problemId, code, language })
  });
  if (!res.ok) throw new Error("Submission failed");
  return res.json() as Promise<{ submission_id: string; status: string }>;
}

export async function fetchSubmission(id: string): Promise<SubmissionResult> {
  const res = await fetch(`${API_URL}/submissions/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Submission not found");
  return res.json();
}

export function hintUrl(submissionId: string) {
  return `${API_URL}/ai/hint/${submissionId}`;
}
