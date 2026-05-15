"use client";

import { useTransition } from "react";
import { toggleTask, deleteTask } from "./actions";
import { Check, Trash2, Calendar, Flag } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

type Task = {
  id: string;
  title: string;
  due_date: string | null;
  priority: string;
  completed: boolean;
};

import { syncTaskToCalendar } from "./actions";

export function TaskList({ tasks, syncedTaskIds }: { tasks: Task[], syncedTaskIds: Set<string> }) {
  return (
    <div className="flex flex-col gap-3 mt-6">
      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No tasks found. Add one above!</p>
      ) : (
        tasks.map((task) => <TaskItem key={task.id} task={task} isSynced={syncedTaskIds.has(task.id)} />)
      )}
    </div>
  );
}

function TaskItem({ task, isSynced }: { task: Task, isSynced: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      toggleTask(task.id, !task.completed);
    });
  };

  const handleDelete = () => {
    startTransition(() => {
      deleteTask(task.id);
    });
  };

  const handleSync = () => {
    startTransition(async () => {
      const res = await syncTaskToCalendar(task.id);
      if (res && !res.success) {
        if (res.error === "Calendar not connected") {
          alert("Please connect your Google Calendar in the Calendar tab first.");
        } else {
          alert(`Sync failed: ${res.error}`);
        }
      }
    });
  };

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border border-border bg-card transition-all ${task.completed ? "opacity-60" : ""}`}>
      <button 
        onClick={handleToggle}
        disabled={isPending}
        className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
          task.completed 
            ? "bg-primary border-primary text-primary-foreground" 
            : "border-muted-foreground hover:border-primary"
        }`}
      >
        {task.completed && <Check className="w-4 h-4" />}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={`font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </h4>
        
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          {task.due_date && (
            <span className={`flex items-center gap-1 ${isOverdue && !task.completed ? "text-red-500 font-medium" : ""}`}>
              <Calendar className="w-3 h-3" />
              {format(new Date(task.due_date), "MMM d, yyyy")}
            </span>
          )}
          <span className="flex items-center gap-1 capitalize">
            <Flag className={`w-3 h-3 ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />
            {task.priority}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button 
          onClick={handleSync}
          disabled={isPending || isSynced}
          title={isSynced ? "Synced to Calendar" : "Push to Google Calendar"}
          className={`p-2 rounded-lg transition-colors ${
            isSynced 
              ? "text-green-500 bg-green-50 dark:bg-green-950/30 cursor-default" 
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          {isSynced ? <Check className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
        </button>
        <button 
          onClick={handleDelete}
          disabled={isPending}
          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
