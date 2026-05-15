"use client";

import { useEffect, useState } from "react";
import { Layers, Clock, Check } from "lucide-react";
import { isPast, parseISO, isToday } from "date-fns";
import Link from "next/link";

type Task = {
  id: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  due_date?: string | null;
};

const PRIORITIES = [
  { key: "high",   label: "High",   icon: "🔴", barColor: "bg-red-500",   textColor: "#ef4444" },
  { key: "medium", label: "Medium", icon: "🟡", barColor: "bg-amber-500", textColor: "#f59e0b" },
  { key: "low",    label: "Low",    icon: "🟢", barColor: "bg-green-500", textColor: "#22c55e" },
] as const;

function AnimatedBar({
  pct,
  colorClass,
  allDone,
}: {
  pct: number;
  colorClass: string;
  allDone: boolean;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full ${allDone ? "bg-green-400" : colorClass} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function PriorityBreakdownCard({ tasks }: { tasks: Task[] }) {
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

  const overdue = tasks.filter(
    (t) =>
      !t.completed &&
      t.due_date &&
      isPast(parseISO(t.due_date)) &&
      !isToday(parseISO(t.due_date))
  ).length;

  return (
    <div className="bento-card flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-semibold text-base">By Priority</h2>
      </div>

      <div className="flex flex-col gap-5">
        {PRIORITIES.map(({ key, label, icon, barColor, textColor }) => {
          const total = tasks.filter((t) => t.priority === key).length;
          const remaining = tasks.filter((t) => t.priority === key && !t.completed).length;
          const noTasks = total === 0;
          const allDone = total > 0 && remaining === 0;
          // Bar fill = remaining/total (how much is left), empty when none or all done
          const pct = noTasks ? 0 : allDone ? 100 : Math.round((remaining / total) * 100);

          return (
            <div
              key={key}
              className="space-y-2"
              style={{ opacity: noTasks ? 0.45 : 1 }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-1.5">
                  {icon} {label}
                </span>

                {allDone ? (
                  <span className="text-xs font-semibold flex items-center gap-1 text-green-500">
                    <Check className="w-3 h-3" strokeWidth={3} /> All done
                  </span>
                ) : (
                  <span
                    className="text-xs font-semibold"
                    style={{ color: noTasks ? undefined : textColor }}
                  >
                    {noTasks ? (
                      <span className="text-muted-foreground font-normal">0 tasks</span>
                    ) : (
                      `${remaining} of ${total} remaining`
                    )}
                  </span>
                )}
              </div>

              <AnimatedBar pct={pct} colorClass={barColor} allDone={allDone} />
            </div>
          );
        })}
      </div>

      {overdue > 0 && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-[10px]">
          <Clock className="w-4 h-4 flex-shrink-0" />
          {overdue} task{overdue !== 1 ? "s" : ""} overdue
        </div>
      )}
    </div>
  );
}
