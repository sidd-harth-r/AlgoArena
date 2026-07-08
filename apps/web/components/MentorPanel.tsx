"use client";

import { useEffect, useRef, useState } from "react";
import { fetchMentorHistory, sendMentorMessage, type MentorMessage } from "@/lib/api";

type Props = {
  submissionId: string | null;
};

export default function MentorPanel({ submissionId }: Props) {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history when submissionId changes
  useEffect(() => {
    if (!submissionId) {
      setMessages([]);
      return;
    }
    fetchMentorHistory(submissionId).then(setMessages).catch(() => setMessages([]));
  }, [submissionId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamText]);

  const send = async () => {
    if (!submissionId || !input.trim() || streaming) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: userMsg, created_at: new Date().toISOString() }]);
    setStreaming(true);
    setStreamText("");

    try {
      const res = await sendMentorMessage(submissionId, userMsg);
      if (!res.ok || !res.body) throw new Error("Failed to send message");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              fullReply += data.token;
              setStreamText(fullReply);
            }
            if (data.done) {
              setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, role: "assistant", content: fullReply, created_at: new Date().toISOString() },
              ]);
              setStreamText("");
            }
            if (data.error) {
              setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, role: "assistant", content: `Error: ${data.error}`, created_at: new Date().toISOString() },
              ]);
              setStreamText("");
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Failed to connect to the mentor. Please try again.", created_at: new Date().toISOString() },
      ]);
    } finally {
      setStreaming(false);
      setStreamText("");
    }
  };

  if (!submissionId) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6" style={{ minHeight: 200 }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(250,93,0,0.08)', border: '1px solid rgba(250,93,0,0.15)' }}>
          <span style={{ fontSize: 20 }}>🤖</span>
        </div>
        <span className="text-xs text-center" style={{ color: 'var(--text-muted)', maxWidth: 220 }}>
          Submit your code first, then ask the AI mentor for feedback on your solution.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 0 }}>
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center gap-2 py-6">
            <span style={{ fontSize: 28 }}>🤖</span>
            <span className="text-xs text-center" style={{ color: 'var(--text-muted)', maxWidth: 240 }}>
              Ask the AI mentor about your code — flaws, logic errors, or optimization tips.
            </span>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="rounded-xl px-3 py-2 text-xs leading-relaxed"
              style={{
                maxWidth: "85%",
                background: msg.role === "user" ? "linear-gradient(135deg, #FA5D00, #D4540A)" : "var(--bg-tertiary)",
                color: msg.role === "user" ? "white" : "var(--text-primary)",
                border: msg.role === "assistant" ? "1px solid var(--border-subtle)" : "none",
                boxShadow: msg.role === "user" ? "0 2px 8px rgba(250,93,0,0.2)" : "none",
              }}
            >
              {msg.role === "assistant" ? <MentorMarkdown content={msg.content} /> : msg.content}
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {streaming && streamText && (
          <div className="flex justify-start">
            <div
              className="rounded-xl px-3 py-2 text-xs leading-relaxed"
              style={{
                maxWidth: "85%",
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <MentorMarkdown content={streamText} />
              <span className="typing-cursor" />
            </div>
          </div>
        )}

        {streaming && !streamText && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-xl px-3 py-2" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-flame)", animationDelay: "0ms" }} />
              <span className="inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-flame)", animationDelay: "150ms" }} />
              <span className="inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-flame)", animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-secondary)" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask about your code..."
          disabled={streaming}
          className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-subtle)",
          }}
        />
        <button
          onClick={send}
          disabled={streaming || !input.trim()}
          className="btn-primary flex items-center gap-1.5 text-xs"
          style={{ padding: "0.4rem 0.8rem" }}
        >
          {streaming ? (
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
          Send
        </button>
      </div>
    </div>
  );
}

/** Simple markdown renderer for mentor responses */
function MentorMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${codeKey++}`}
            className="mono rounded-md p-2 my-1 text-xs overflow-x-auto"
            style={{ background: "rgba(0,0,0,0.06)", color: "var(--accent-flame)" }}
          >
            {codeLines.join("\n")}
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className="text-xs font-semibold mt-2 mb-1" style={{ color: "var(--text-primary)" }}>{line.slice(4)}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="text-xs font-bold mt-2 mb-1" style={{ color: "var(--text-primary)" }}>{line.slice(3)}</h3>);
    } else if (line.startsWith("- ")) {
      elements.push(<li key={i} className="ml-3" style={{ listStyleType: "disc" }}>{renderMentorInline(line.slice(2))}</li>);
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) elements.push(<li key={i} className="ml-3" style={{ listStyleType: "decimal" }}>{renderMentorInline(match[2])}</li>);
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 4 }} />);
    } else {
      elements.push(<p key={i} className="mb-0.5">{renderMentorInline(line)}</p>);
    }
  }

  // Handle unclosed code block
  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre
        key={`code-${codeKey}`}
        className="mono rounded-md p-2 my-1 text-xs overflow-x-auto"
        style={{ background: "rgba(0,0,0,0.06)", color: "var(--accent-flame)" }}
      >
        {codeLines.join("\n")}
      </pre>
    );
  }

  return <>{elements}</>;
}

function renderMentorInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIdx = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
    const m = match[0];
    if (m.startsWith("`")) {
      parts.push(
        <code key={key++} className="mono rounded px-1 py-0.5" style={{ background: "rgba(250,93,0,0.06)", color: "var(--accent-flame)", fontSize: "0.85em" }}>
          {m.slice(1, -1)}
        </code>
      );
    } else if (m.startsWith("**")) {
      parts.push(<strong key={key++} style={{ color: "var(--text-primary)" }}>{m.slice(2, -2)}</strong>);
    }
    lastIdx = match.index + m.length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}
