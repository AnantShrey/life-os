"use client";

import { useState, useTransition } from "react";
import { Calendar, Check } from "lucide-react";
import { toggleTask } from "@/app/tasks/actions";
import { format } from "date-fns";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  due_date?: string | null;
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};

function TaskRow({ task }: { task: Task }) {
  const [done, setDone] = useState(task.completed);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !done;
    setDone(next);
    startTransition(async () => {
      await toggleTask(task.id, next);
    });
  };

  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-2 rounded-[10px] transition-colors cursor-pointer group hover:bg-muted/50 ${
        done ? "opacity-60" : ""
      }`}
      onClick={handleToggle}
    >
      <button
        disabled={isPending}
        type="button"
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          done ? "bg-primary border-primary" : "border-muted-foreground/40 hover:border-primary"
        }`}
      >
        {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>

      <span
        className={`flex-1 text-sm font-medium truncate ${
          done ? "line-through text-muted-foreground" : ""
        }`}
      >
        {task.title}
      </span>

      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_COLORS[task.priority] || "bg-muted"}`}
      />
    </div>
  );
}

export function DueTodayCard({
  tasks,
  today,
  totalDueToday,
}: {
  tasks: Task[];
  today: string;
  totalDueToday: number;
}) {
  const todayLabel = format(new Date(), "EEEE, MMM d");
  const extra = totalDueToday - tasks.length;

  return (
    <div className="bento-card flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold text-base">Due Today</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 ml-7">{todayLabel}</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2 text-center">
          <span className="text-3xl">🎉</span>
          <p className="text-sm font-medium">Nothing due today!</p>
          <p className="text-xs text-muted-foreground">You're all caught up</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            {tasks.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
          {extra > 0 && (
            <Link
              href="/tasks"
              className="text-xs text-primary font-medium hover:underline text-center"
            >
              +{extra} more →
            </Link>
          )}
        </>
      )}
    </div>
  );
}
