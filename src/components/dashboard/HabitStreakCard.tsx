import { Flame, Check } from "lucide-react";
import Link from "next/link";

type Habit = { id: string; name: string };
type HabitLog = { habit_id: string; log_date: string; completed: boolean };

/**
 * Calculate current streak counting BACKWARDS from:
 * - today, IF today is already completed
 * - yesterday, IF today is NOT yet completed
 * This prevents a streak of 5 from resetting to 0 at 8am just
 * because the user hasn't checked in yet.
 */
function calcCurrentStreak(
  habitId: string,
  logs: HabitLog[],
  today: string
): number {
  const completedDates = new Set(
    logs.filter((l) => l.habit_id === habitId && l.completed).map((l) => l.log_date)
  );
  const doneToday = completedDates.has(today);

  let streak = 0;
  const d = new Date(today);

  // If not done today, start counting from yesterday
  if (!doneToday) {
    d.setDate(d.getDate() - 1);
  }

  while (true) {
    const ds = d.toISOString().split("T")[0];
    if (completedDates.has(ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function calcBestStreak(habitId: string, logs: HabitLog[]): number {
  const dates = logs
    .filter((l) => l.habit_id === habitId && l.completed)
    .map((l) => l.log_date)
    .sort();
  if (!dates.length) return 0;
  let best = 1,
    cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    cur = diff === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
  }
  return best;
}

function perfectDaysThisWeek(
  habits: Habit[],
  logs: HabitLog[],
  today: string
): number {
  if (!habits.length) return 0;
  const monday = new Date(today);
  const dow = monday.getDay();
  monday.setDate(monday.getDate() - (dow === 0 ? 6 : dow - 1));
  let perfect = 0;
  const d = new Date(monday);
  const todayDate = new Date(today);
  while (d <= todayDate) {
    const ds = d.toISOString().split("T")[0];
    const allDone = habits.every((h) =>
      logs.some((l) => l.habit_id === h.id && l.log_date === ds && l.completed)
    );
    if (allDone) perfect++;
    d.setDate(d.getDate() + 1);
  }
  return perfect;
}

export function HabitStreakCard({
  habits,
  logs,
  today,
}: {
  habits: Habit[];
  logs: HabitLog[];
  today: string;
}) {
  if (!habits.length) {
    return (
      <div className="bento-card flex flex-col items-center justify-center h-48 text-center gap-3">
        <Flame className="w-8 h-8 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          <Link href="/habits" className="text-primary hover:underline">
            Add your first habit to start tracking →
          </Link>
        </p>
      </div>
    );
  }

  const enriched = habits
    .map((h) => ({
      ...h,
      currentStreak: calcCurrentStreak(h.id, logs, today),
      bestStreak: calcBestStreak(h.id, logs),
      doneToday: logs.some(
        (l) => l.habit_id === h.id && l.log_date === today && l.completed
      ),
    }))
    .sort((a, b) => b.currentStreak - a.currentStreak);

  const topHabit = enriched[0];
  const perfectDays = perfectDaysThisWeek(habits, logs, today);

  return (
    <div className="bento-card flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-500" />
        <h2 className="font-semibold text-base">Habit Streaks</h2>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-[14px] p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Best streak
          </p>
          <p className="text-[28px] font-bold leading-none text-foreground">
            {topHabit.currentStreak}
            <span className="text-sm font-normal text-muted-foreground ml-1">days</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {topHabit.name}
          </p>
        </div>
        <div className="bg-muted/50 rounded-[14px] p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Perfect days
          </p>
          <p className="text-[28px] font-bold leading-none text-foreground">
            {perfectDays}
            <span className="text-base font-normal text-muted-foreground">/7</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">this week</p>
        </div>
      </div>

      {/* Habit list */}
      <div className="flex flex-col divide-y divide-border/50">
        {enriched.map((h) => {
          const pct =
            h.bestStreak > 0
              ? Math.round((h.currentStreak / h.bestStreak) * 100)
              : 0;
          return (
            <div
              key={h.id}
              className="flex items-center gap-3 py-3 px-2 rounded-[10px] hover:bg-muted/40 transition-colors"
            >
              {/* Done indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  h.doneToday
                    ? "bg-green-500 border-green-500"
                    : "border-muted-foreground/40"
                }`}
              >
                {h.doneToday && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{h.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {h.currentStreak}/{h.bestStreak || 1}
                  </span>
                </div>
              </div>

              {/* Streak badge */}
              <div className="flex items-center gap-1 text-orange-500 text-xs font-semibold bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full flex-shrink-0">
                🔥 {h.currentStreak}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
