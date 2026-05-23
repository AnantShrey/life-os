"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Target, CheckSquare, BarChart2, Flag, Check, Link as LinkIcon } from "lucide-react";
import { Goal } from "@/components/goals/GoalCard";
import { Milestone } from "@/components/goals/MilestoneList";

export function GoalsDashboardCard({ 
  goals,
  milestones
}: { 
  goals: Goal[];
  milestones: Milestone[];
}) {
  const [timeframe, setTimeframe] = useState("this_month");

  const TIMEFRAMES = [
    { id: "this_week", label: "Week" },
    { id: "this_month", label: "Month" },
    { id: "this_year", label: "Year" },
    { id: "overall", label: "Overall" }
  ];

  const filteredGoals = useMemo(() => {
    return goals.filter(g => g.timeframe === timeframe).sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0; // maintain general created_at sort from parent
    });
  }, [goals, timeframe]);

  const total = filteredGoals.length;
  const completed = filteredGoals.filter(g => g.completed).length;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;
  
  const displayGoals = filteredGoals.slice(0, 4);
  const remaining = total - 4;

  const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "checklist": return <CheckSquare className="w-3 h-3 text-muted-foreground" />;
      case "progress": return <BarChart2 className="w-3 h-3 text-muted-foreground" />;
      case "milestone": return <Flag className="w-3 h-3 text-muted-foreground" />;
      default: return null;
    }
  };

  return (
    <div className="bento-card flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-sky-500" />
          <h2 className="font-bold text-[17px]">Goals</h2>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-[8px]">
          {TIMEFRAMES.map(tf => (
            <button 
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-2 py-1 rounded-[6px] text-[12px] font-medium transition-all ${
                timeframe === tf.id ? "bg-white dark:bg-slate-700 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center pb-2">
          <Target className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm font-medium mb-1">No {TIMEFRAMES.find(t=>t.id===timeframe)?.label.toLowerCase()} goals yet</p>
          <Link href="/goals" className="text-xs text-primary hover:underline">
            + Add a goal &rarr;
          </Link>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          {/* Top stat */}
          <div className="mb-5">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[28px] font-bold leading-none">{completed} / {total}</span>
            </div>
            <p className="text-[13px] text-muted-foreground mb-3">
              goals completed this {TIMEFRAMES.find(t=>t.id===timeframe)?.label.toLowerCase()}
            </p>
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-sky-500 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>

          {/* Goal List */}
          <div className="flex flex-col flex-1">
            {displayGoals.map((g, i) => {
              const isLast = i === displayGoals.length - 1;
              
              // Compute right side display based on type
              let RightDisplay = null;
              if (g.type === "checklist") {
                RightDisplay = (
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${g.completed ? "bg-green-500 border-green-500 text-white" : "border-slate-300 dark:border-slate-600"}`}>
                    {g.completed && <Check className="w-3 h-3" />}
                  </div>
                );
              } else if (g.type === "progress") {
                const p = Math.min(100, Math.max(0, ((g.current_value || 0) / (g.target_value || 1)) * 100));
                RightDisplay = (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{g.current_value || 0}/{g.target_value || 1} {g.unit || ""}</span>
                    <div className="w-[60px] h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${p}%` }} />
                    </div>
                  </div>
                );
              } else if (g.type === "milestone") {
                const ms = milestones.filter(m => m.goal_id === g.id);
                const comp = ms.filter(m => m.completed).length;
                RightDisplay = <span className="text-[11px] text-muted-foreground">{comp}/{ms.length}</span>;
              }

              return (
                <div key={g.id} className={`flex items-center justify-between py-2.5 group hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-[8px] px-2 -mx-2 transition-colors ${!isLast ? "border-b-[0.5px] border-border" : ""}`}>
                  <div className="flex items-center gap-2 min-w-0 pr-4">
                    <TypeIcon type={g.type} />
                    <span className={`text-[13px] font-medium truncate ${g.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {g.title}
                    </span>
                    {g.linked_module && <LinkIcon className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />}
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {RightDisplay}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 flex items-center justify-between">
            {remaining > 0 ? (
              <Link href="/goals" className="text-xs text-primary hover:underline">
                +{remaining} more goals
              </Link>
            ) : <span />}
            
            {total > 0 && remaining <= 0 && (
              <Link href="/goals" className="text-xs text-muted-foreground hover:text-foreground ml-auto">
                View all &rarr;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
