import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoArena — Competitive Programming with Big-O Feedback",
  description:
    "Practice algorithms, submit Python solutions, and receive static complexity analysis with Socratic AI hints. Built with Next.js, FastAPI, and Tree-sitter AST analysis."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="glass sticky top-0 z-50" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center gap-2 group" id="nav-logo">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-110">
                A
              </div>
              <span className="text-lg font-bold tracking-tight gradient-text">AlgoArena</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/problems" id="nav-problems" className="nav-link rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                Problems
              </Link>
              <Link href="/dashboard" id="nav-dashboard" className="nav-link rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                Dashboard
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
