"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toggleHabitLog } from "@/app/habits/actions";
import { format } from "date-fns";
import Link from "next/link";

type Habit = { id: string; name: string };
type HabitLog = { habit_id: string; log_date: string; completed: boolean };

function calcCurrentStreak(habitId: string, logs: HabitLog[], today: string): number {
  const completedDates = new Set(
    logs.filter((l) => l.habit_id === habitId && l.completed).map((l) => l.log_date)
  );
  const doneToday = completedDates.has(today);
  let streak = 0;
  const d = new Date(today);
  if (!doneToday) d.setDate(d.getDate() - 1); // start from yesterday if today not done
  while (true) {
    const ds = d.toISOString().split("T")[0];
    if (completedDates.has(ds)) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

function HabitRow({
  habit,
  doneToday,
  streak,
  today,
}: {
  habit: Habit;
  doneToday: boolean;
  streak: number;
  today: string;
}) {
  const [optimistic, setOptimistic] = useState(doneToday);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !optimistic;
    setOptimistic(next);
    startTransition(() => {
      toggleHabitLog(habit.id, today, !next);
    });
  };

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-[12px] transition-colors cursor-pointer select-none ${
        optimistic ? "bg-primary/5" : "hover:bg-muted/50"
      }`}
      onClick={handleToggle}
    >
      <button
        disabled={isPending}
        className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          optimistic
            ? "bg-primary border-primary"
            : "border-muted-foreground/40 hover:border-primary"
        }`}
        type="button"
      >
        {optimistic && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </button>

      <span
        className={`flex-1 text-[15px] font-medium truncate transition-colors ${
          optimistic ? "text-muted-foreground line-through" : ""
        }`}
      >
        {habit.name}
      </span>

      <span className="text-xs font-semibold text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full flex-shrink-0">
        🔥 {streak}
      </span>
    </div>
  );
}

export function TodayHabitsCard({
  habits,
  logs,
  today,
}: {
  habits: Habit[];
  logs: HabitLog[];
  today: string;
}) {
  const enriched = habits.map((h) => ({
    ...h,
    doneToday: logs.some((l) => l.habit_id === h.id && l.log_date === today && l.completed),
    streak: calcCurrentStreak(h.id, logs, today),
  }));

  const doneCount = enriched.filter((h) => h.doneToday).length;
  const pct = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;
  const dateLabel = format(new Date(), "EEEE, MMM d");

  if (!habits.length) {
    return (
      <div className="bento-card flex flex-col items-center justify-center h-48 text-center gap-3">
        <p className="text-muted-foreground text-sm">
          <Link href="/habits" className="text-primary hover:underline">
            Add your first habit to start tracking →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bento-card flex flex-col gap-4">
      <div>
        <h2 className="font-semibold text-base">Today</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{dateLabel}</p>
      </div>

      <div className="flex flex-col gap-1">
        {enriched.map((h) => (
          <HabitRow
            key={h.id}
            habit={h}
            doneToday={h.doneToday}
            streak={h.streak}
            today={today}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-auto pt-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">
            {doneCount} of {habits.length} habits done today
          </span>
          <span className="text-xs font-semibold text-primary">{pct}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
