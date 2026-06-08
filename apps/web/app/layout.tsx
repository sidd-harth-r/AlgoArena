import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoArena — Competitive Programming with Big-O Feedback",
  description:
    "Practice algorithms, submit Python solutions, and receive static complexity analysis with Socratic AI hints. Built with Next.js, FastAPI, and AST analysis."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="glass sticky top-0 z-50" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center gap-2 group" id="nav-logo">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-lg transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #FA5D00, #D4540A)', boxShadow: '0 2px 8px rgba(250,93,0,0.25)' }}>
                A
              </div>
              <span className="text-lg font-bold tracking-tight gradient-text">AlgoArena</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/problems" id="nav-problems" className="nav-link rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200" style={{ color: 'var(--text-secondary)' }}>
                Problems
              </Link>
              <Link href="/roadmap" id="nav-roadmap" className="nav-link rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200" style={{ color: 'var(--text-secondary)' }}>
                Roadmap
              </Link>
              <Link href="/contests" id="nav-contests" className="nav-link rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200" style={{ color: 'var(--text-secondary)' }}>
                Contests
              </Link>
              <Link href="/dashboard" id="nav-dashboard" className="nav-link rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200" style={{ color: 'var(--text-secondary)' }}>
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
