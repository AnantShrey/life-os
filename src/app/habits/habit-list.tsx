"use client";

import { useTransition } from "react";
import { toggleHabitLog, deleteHabit } from "./actions";
import { Check, Trash2, CalendarCheck } from "lucide-react";
import { format } from "date-fns";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function FrequencyBadge({ habit }: { habit: { frequency_type?: string | null; frequency_days?: number[] | null } }) {
  const freq = habit.frequency_type || "daily";
  let label = "Daily";
  if (freq === "weekly" && habit.frequency_days?.length) {
    label = "Weekly: " + habit.frequency_days.map(d => WEEK_DAYS[d]).join(", ");
  } else if (freq === "monthly" && habit.frequency_days?.length) {
    const ordinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    label = "Monthly: " + habit.frequency_days.map(ordinal).join(", ");
  }
  return (
    <span className="text-[11px] font-medium bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full">
      {label}
    </span>
  );
}


type Habit = {
  id: string;
  name: string;
  description: string | null;
  frequency_type?: "daily" | "weekly" | "monthly" | null;
  frequency_days?: number[] | null;
  end_date?: string | null;
};

type HabitLog = {
  habit_id: string;
  log_date: string;
  completed: boolean;
};

import { syncHabitToCalendar, unsyncHabitFromCalendar } from "./actions";

export function HabitList({ 
  habits, 
  todayLogs,
  syncedHabitIds
}: { 
  habits: Habit[]; 
  todayLogs: HabitLog[];
  syncedHabitIds: Set<string>;
}) {
  const todayDateStr = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex flex-col gap-4 mt-6">
      {habits.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No habits found. Create one above!</p>
      ) : (
        habits.map((habit) => {
          const isCompletedToday = todayLogs.some(log => log.habit_id === habit.id && log.completed);
          
          return (
            <HabitItem 
              key={habit.id} 
              habit={habit} 
              isCompletedToday={isCompletedToday} 
              todayDateStr={todayDateStr}
              isSynced={syncedHabitIds.has(habit.id)}
            />
          );
        })
      )}
    </div>
  );
}

function HabitItem({ 
  habit, 
  isCompletedToday, 
  todayDateStr,
  isSynced
}: { 
  habit: Habit; 
  isCompletedToday: boolean;
  todayDateStr: string;
  isSynced: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      toggleHabitLog(habit.id, todayDateStr, isCompletedToday);
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this habit and all its history?")) {
      startTransition(() => {
        deleteHabit(habit.id);
      });
    }
  };

  const handleSyncToggle = () => {
    startTransition(async () => {
      if (isSynced) {
        const res = await unsyncHabitFromCalendar(habit.id);
        if (res && !res.success) alert(`Unsync failed: ${res.error}`);
      } else {
        const res = await syncHabitToCalendar(habit.id);
        if (res && !res.success) {
          if (res.error === "Calendar not connected") {
            alert("Please connect your Google Calendar in the Calendar tab first.");
          } else {
            alert(`Sync failed: ${res.error}`);
          }
        }
      }
    });
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)] transition-all ${
        isCompletedToday
          ? "bg-primary/5 border border-primary/20"
          : "bg-card border border-border/50 hover:border-primary/40"
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarCheck className={`w-5 h-5 ${isCompletedToday ? "text-primary" : "text-muted-foreground"}`} />
          <h4 className="font-semibold text-lg">{habit.name}</h4>
          {/* Frequency badge */}
          <FrequencyBadge habit={habit} />
        </div>
        {habit.description && (
          <p className="text-sm text-muted-foreground mt-1 ml-7">{habit.description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <div className="flex items-center gap-2 mr-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Sync to Calendar</span>
          <button 
            onClick={handleSyncToggle}
            disabled={isPending}
            className={`w-10 h-5 rounded-full relative transition-colors ${isSynced ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
          >
            <div className={`absolute top-0.5 bottom-0.5 w-4 bg-white rounded-full transition-all ${isSynced ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        <button 
          onClick={handleToggle}
          disabled={isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isCompletedToday
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-foreground hover:bg-muted/80"
          }`}
        >
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
            isCompletedToday ? "border-transparent" : "border-foreground/30"
          }`}>
            {isCompletedToday && <Check className="w-3.5 h-3.5" />}
          </div>
          {isCompletedToday ? "Completed" : "Mark Done"}
        </button>

        <button 
          onClick={handleDelete}
          disabled={isPending}
          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          title="Delete habit"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
