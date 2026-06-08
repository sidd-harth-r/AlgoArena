"use client";

import React, { useState } from "react";
import Link from "next/link";
import SubmissionsHeatmap from "@/components/SubmissionsHeatmap";
import type { DashboardData } from "@/lib/api";

type DashboardClientProps = {
  data: DashboardData;
};

export default function DashboardClient({ data }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"recent_ac" | "recent_all">("recent_ac");

  const { stats, calendar, streak, recent_ac, recent_all } = data;

  // Calculate circular progress ring properties
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = stats.total.total > 0 ? (stats.total.solved / stats.total.total) * 100 : 0;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Format relative date (e.g., "2 days ago")
  const getRelativeTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
      }
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const currentList = activeTab === "recent_ac" ? recent_ac : recent_all;

  // Theme Constants (High-contrast Warm/Harvest)
  const cardStyle = {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-medium)",
    borderRadius: "12px"
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 pt-28 pb-16" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="animate-fade-in space-y-1">
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Track your progress and activity across AlgoArena.
        </p>
      </div>

      {/* Top Row: Solved Stats Card (Full Width) */}
      <div className="animate-fade-in p-6 sm:p-8" style={cardStyle}>
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-around">
          
          {/* Solved Progress Circle */}
          <div className="flex items-center gap-8 justify-center">
            <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
              <svg className="absolute -rotate-90 transform" width={radius * 2} height={radius * 2}>
                {/* Background Ring */}
                <circle
                  className="transition-all"
                  stroke="rgba(29, 30, 28, 0.08)"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                {/* Foreground Ring */}
                <circle
                  className="transition-all duration-500 ease-out"
                  stroke="var(--accent-primary, #FA5D00)"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + " " + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>
              {/* Text inside Ring */}
              <div className="text-center z-10">
                <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {stats.total.solved}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-secondary)" }}>
                  / {stats.total.total} Solved
                </div>
              </div>
            </div>
            
            {/* Attempting count */}
            <div className="text-center sm:text-left">
              <div className="text-3xl font-bold" style={{ color: "var(--accent-primary)" }}>
                {stats.attempting}
              </div>
              <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                Attempting
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden h-24 w-px md:block" style={{ background: "var(--border-medium)" }} />

          {/* Difficulty breakdown list */}
          <div className="flex-1 max-w-md space-y-4">
            {/* Easy */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-bold" style={{ color: "#1A7A4A" }}>Easy</span>
                <span style={{ color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>{stats.easy.solved}</strong>/{stats.easy.total}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(29, 30, 28, 0.08)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.easy.total > 0 ? (stats.easy.solved / stats.easy.total) * 100 : 0}%`, background: "#1A7A4A" }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-bold" style={{ color: "#C08200" }}>Medium</span>
                <span style={{ color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>{stats.medium.solved}</strong>/{stats.medium.total}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(29, 30, 28, 0.08)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.medium.total > 0 ? (stats.medium.solved / stats.medium.total) * 100 : 0}%`, background: "#C08200" }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-bold" style={{ color: "#9B2020" }}>Hard</span>
                <span style={{ color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>{stats.hard.solved}</strong>/{stats.hard.total}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(29, 30, 28, 0.08)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.hard.total > 0 ? (stats.hard.solved / stats.hard.total) * 100 : 0}%`, background: "#9B2020" }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Middle Row: Submissions Heatmap */}
      <div className="animate-fade-in">
        <SubmissionsHeatmap calendar={calendar} streak={streak} />
      </div>

      {/* Bottom Row: Recent Activity Tab & List */}
      <div className="animate-fade-in p-6 space-y-4" style={cardStyle}>
        {/* Tabs and header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--border-medium)" }}>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("recent_ac")}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold border-b-2 transition-all`}
              style={{
                borderColor: activeTab === "recent_ac" ? "var(--accent-primary)" : "transparent",
                color: activeTab === "recent_ac" ? "var(--accent-primary)" : "var(--text-secondary)"
              }}
            >
              <span>✅</span> Recent AC
            </button>
            <button
              onClick={() => setActiveTab("recent_all")}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold border-b-2 transition-all`}
              style={{
                borderColor: activeTab === "recent_all" ? "var(--accent-primary)" : "transparent",
                color: activeTab === "recent_all" ? "var(--accent-primary)" : "var(--text-secondary)"
              }}
            >
              <span>📝</span> Solutions
            </button>
          </div>
          <Link
            href="/problems"
            className="text-xs font-semibold hover:underline flex items-center gap-1 self-start sm:self-center"
            style={{ color: "var(--accent-primary)" }}
          >
            View all problems &gt;
          </Link>
        </div>

        {/* List items */}
        <div className="space-y-2.5">
          {currentList.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: "var(--text-secondary)" }}>
              No submissions found.
            </div>
          ) : (
            currentList.map((item) => (
              <Link
                key={item.id}
                href={`/problems/${item.problem_slug}`}
                className="flex items-center justify-between p-4 rounded-lg transition-all border hover:bg-[rgba(250,93,0,0.03)]"
                style={{
                  background: "var(--bg-primary)",
                  borderColor: "var(--border-subtle)"
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "rgba(29, 30, 28, 0.06)", color: "var(--text-secondary)" }}>
                    {item.language}
                  </span>
                  <span className="font-semibold text-sm sm:text-base transition-colors hover:text-[var(--accent-primary)]" style={{ color: "var(--text-primary)" }}>
                    {item.problem_title}
                  </span>
                  {"status" in item && (
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded border`}
                      style={{
                        background: (item as any).status === "ACCEPTED" ? "rgba(26, 122, 74, 0.08)" : "rgba(155, 32, 32, 0.08)",
                        color: (item as any).status === "ACCEPTED" ? "#1A7A4A" : "#9B2020",
                        borderColor: (item as any).status === "ACCEPTED" ? "rgba(26, 122, 74, 0.15)" : "rgba(155, 32, 32, 0.15)"
                      }}
                    >
                      {(item as any).status}
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                  {item.created_at ? getRelativeTime(item.created_at) : ""}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
