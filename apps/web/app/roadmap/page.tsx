"use client";

import { useEffect, useState } from "react";
import RoadmapGraph from "@/components/RoadmapGraph";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type RoadmapNode = {
  id: string;
  label: string;
  prereqs: string[];
  problems: { id: number; title: string; slug: string; difficulty: string; solved: boolean }[];
  total: number;
  solved: number;
};

export default function RoadmapPage() {
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/roadmap/`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        console.log("Roadmap data received:", data?.length, "nodes");
        setNodes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Roadmap fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold gradient-text">Study Roadmap</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Follow the dependency tree to master each topic in order. Click a node to see its problems.
          </p>
        </div>
        <div className="animate-fade-in">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="shimmer h-64 w-full rounded-xl" />
            </div>
          ) : nodes.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <p style={{ color: 'var(--text-muted)' }}>No roadmap data available. Please seed the database first.</p>
            </div>
          ) : (
            <RoadmapGraph nodes={nodes} />
          )}
        </div>
      </div>
    </main>
  );
}
