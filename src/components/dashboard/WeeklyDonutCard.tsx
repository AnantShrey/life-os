"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";
import Link from "next/link";

type Task = {
  id: string;
  completed: boolean;
  completed_at?: string | null;
  due_date?: string | null;
};

export function WeeklyDonutCard({ tasks }: { tasks: Task[] }) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const weekTasks = tasks.filter((t) => {
    if (t.completed && t.completed_at) {
      return isWithinInterval(parseISO(t.completed_at), { start: weekStart, end: weekEnd });
    }
    if (!t.completed && t.due_date) {
      return isWithinInterval(parseISO(t.due_date), { start: weekStart, end: weekEnd });
    }
    return false;
  });

  const completed = tasks.filter(
    (t) =>
      t.completed &&
      t.completed_at &&
      isWithinInterval(parseISO(t.completed_at), { start: weekStart, end: weekEnd })
  ).length;

  const pending = tasks.filter(
    (t) =>
      !t.completed &&
      t.due_date &&
      isWithinInterval(parseISO(t.due_date), { start: weekStart, end: weekEnd })
  ).length;

  const total = completed + pending;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const data = [
    { name: "Done", value: completed || 0 },
    { name: "Pending", value: pending || (total === 0 ? 1 : 0) },
  ];

  const COLORS = total === 0 ? ["#e2e8f0", "#e2e8f0"] : ["#0ea5e9", "#e2e8f0"];

  if (!tasks.length) {
    return (
      <div className="bento-card flex flex-col items-center justify-center h-48 text-center gap-3">
        <p className="text-muted-foreground text-sm">
          <Link href="/tasks" className="text-primary hover:underline">
            No tasks yet — add one to get started →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bento-card flex flex-col gap-4">
      <h2 className="font-semibold text-base">This Week</h2>

      <div className="relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              startAngle={90}
              endAngle={-270}
              paddingAngle={total > 0 ? 3 : 0}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, name) => [`${v ?? 0} tasks`, name]}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[32px] font-bold leading-none text-foreground">{pct}%</span>
          <span className="text-[11px] text-muted-foreground mt-1">done</span>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground -mt-2">tasks done this week</p>

      {/* Stat pills */}
      <div className="flex gap-3 justify-center">
        <span className="flex items-center gap-1.5 text-xs font-medium bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full">
          ✅ {completed} completed
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
          ⏳ {pending} remaining
        </span>
      </div>
    </div>
  );
}
