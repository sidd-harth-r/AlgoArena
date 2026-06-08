"use client";

import React, { useMemo } from "react";

type SubmissionsHeatmapProps = {
  calendar: Record<string, number>;
  streak: {
    current: number;
    max: number;
    total_active_days: number;
  };
};

export default function SubmissionsHeatmap({ calendar, streak }: SubmissionsHeatmapProps) {
  // Generate the dates for the last 365 days aligned to weeks
  const { days, months } = useMemo(() => {
    const today = new Date();
    const daysArray: { date: Date; count: number; dateStr: string }[] = [];
    
    // We want 53 weeks of data (approx 371 days)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 365);
    // Align startDate to Sunday (0)
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const temp = new Date(startDate);
    const monthsInfo: { label: string; index: number }[] = [];
    let lastMonth = -1;

    let idx = 0;
    while (temp <= today || daysArray.length % 7 !== 0) {
      const dateStr = temp.toISOString().split("T")[0];
      const count = calendar[dateStr] ?? 0;
      
      daysArray.push({
        date: new Date(temp),
        count,
        dateStr
      });

      const currentMonth = temp.getMonth();
      if (currentMonth !== lastMonth && daysArray.length % 7 === 0) {
        const monthLabel = temp.toLocaleString("default", { month: "short" });
        monthsInfo.push({
          label: monthLabel,
          index: Math.floor(idx / 7)
        });
        lastMonth = currentMonth;
      }

      temp.setDate(temp.getDate() + 1);
      idx++;
    }

    return { days: daysArray, months: monthsInfo };
  }, [calendar]);

  // Color mapping based on count
  const getCellBg = (count: number) => {
    if (count === 0) return "rgba(29, 30, 28, 0.08)";
    if (count <= 1) return "rgba(250, 93, 0, 0.25)";
    if (count <= 3) return "rgba(250, 93, 0, 0.5)";
    if (count <= 6) return "rgba(250, 93, 0, 0.75)";
    return "var(--accent-primary, #FA5D00)";
  };

  // Sum total submissions in past year
  const totalSubmissions = useMemo(() => {
    return Object.values(calendar).reduce((acc, curr) => acc + curr, 0);
  }, [calendar]);

  const cardStyle = {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-medium)",
    borderRadius: "12px"
  };

  return (
    <div className="p-6" style={cardStyle}>
      {/* Header */}
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {totalSubmissions} submissions
          </span>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            in the past one year
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div style={{ color: "var(--text-secondary)" }}>
            Total active days: <strong style={{ color: "var(--text-primary)" }}>{streak.total_active_days}</strong>
          </div>
          <div style={{ color: "var(--text-secondary)" }}>
            Max streak: <strong style={{ color: "var(--text-primary)" }}>{streak.max}</strong>
          </div>
          <div style={{ color: "var(--text-secondary)" }}>
            Current streak: <strong style={{ color: "var(--text-primary)" }}>{streak.current}</strong>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[760px] pr-4">
          <div className="relative grid grid-flow-col grid-rows-7 gap-[3px]" style={{ height: "115px" }}>
            {days.map((day, i) => (
              <div
                key={day.dateStr}
                className="group relative h-[14px] w-[14px] rounded-[2px] transition-colors hover:ring-1 hover:ring-black/20"
                style={{
                  backgroundColor: getCellBg(day.count)
                }}
              >
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2.5 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-xl border border-white/10">
                  {day.count} submissions on {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>

          {/* Month Labels */}
          <div className="mt-2 flex text-xs justify-between" style={{ color: "var(--text-secondary)" }}>
            {months.map((m, idx) => (
              <span key={idx} className="block text-center" style={{ width: "3.8%" }}>
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
