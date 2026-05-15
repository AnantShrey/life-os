"use client";

import { format, subDays, isSameDay, eachDayOfInterval } from "date-fns";

export function TaskVelocityChart({ completedTasks }: { completedTasks: any[] }) {
  const today = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  const data = last7Days.map(date => {
    const count = completedTasks.filter(task => {
      if (!task.completed_at) return false;
      return isSameDay(new Date(task.completed_at), date);
    }).length;
    return {
      date,
      dayName: format(date, "EEE"),
      count,
    };
  });

  const maxCount = Math.max(...data.map(d => d.count), 5); // Minimum scale of 5

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-full flex flex-col">
      <h3 className="font-semibold text-lg mb-6">Task Velocity (Last 7 Days)</h3>
      <div className="flex-1 flex items-end justify-between gap-2 mt-auto h-40">
        {data.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
            <div className="w-full bg-muted rounded-t-md relative flex items-end justify-center h-full">
              <div 
                className="w-full bg-primary/80 group-hover:bg-primary transition-all rounded-t-md"
                style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: day.count > 0 ? '4px' : '0' }}
              >
                {day.count > 0 && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{day.dayName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HabitHeatmap({ logs }: { logs: any[] }) {
  const today = new Date();
  const days = eachDayOfInterval({
    start: subDays(today, 59), // 60 days total
    end: today,
  });

  // Create a map for O(1) lookup
  const logMap = new Map();
  logs.forEach(log => {
    const d = log.log_date;
    logMap.set(d, (logMap.get(d) || 0) + 1);
  });

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-full flex flex-col">
      <h3 className="font-semibold text-lg mb-6">Habit Consistency (Last 60 Days)</h3>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2">
          {days.map((date, i) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const count = logMap.get(dateStr) || 0;
            
            // Determine intensity
            let bgClass = "bg-muted"; // 0
            if (count === 1) bgClass = "bg-primary/30";
            else if (count === 2) bgClass = "bg-primary/60";
            else if (count >= 3) bgClass = "bg-primary";

            return (
              <div 
                key={i} 
                title={`${dateStr}: ${count} habits completed`}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${bgClass} transition-colors hover:ring-2 hover:ring-foreground/20`}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-muted"></div>
        <div className="w-3 h-3 rounded-sm bg-primary/30"></div>
        <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
        <div className="w-3 h-3 rounded-sm bg-primary"></div>
        <span>More</span>
      </div>
    </div>
  );
}
