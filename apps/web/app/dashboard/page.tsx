import DashboardClient from "./DashboardClient";
import { fetchDashboardData } from "@/lib/api";

export const metadata = { title: "Dashboard — AlgoArena" };

export default async function DashboardPage() {
  const data = await fetchDashboardData().catch((err) => {
    console.error("Error loading dashboard data:", err);
    return null;
  });

  if (!data) {
    return (
      <main className="min-h-screen px-6 py-10 flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Failed to load Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Please make sure the backend server is running and try again.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full" style={{ background: "var(--bg-primary)" }}>
      <DashboardClient data={data} />
    </main>
  );
}
