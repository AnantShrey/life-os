"use client";
import { CheckSquare, BarChart2, Flag } from "lucide-react";

export type GoalType = "checklist" | "progress" | "milestone";

export function GoalTypeSelector({ 
  selected, 
  onChange 
}: { 
  selected: GoalType; 
  onChange: (t: GoalType) => void 
}) {
  const options = [
    {
      id: "checklist",
      label: "Checklist",
      desc: "Simple done/not done",
      icon: CheckSquare
    },
    {
      id: "progress",
      label: "Progress",
      desc: "Track a number toward a target",
      icon: BarChart2
    },
    {
      id: "milestone",
      label: "Milestone",
      desc: "Break into steps",
      icon: Flag
    }
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {options.map(opt => {
        const Icon = opt.icon;
        const isSelected = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex flex-col items-start p-3 sm:p-4 rounded-[12px] border-[1.5px] text-left transition-all ${
              isSelected 
                ? "border-sky-500 bg-sky-50 dark:bg-slate-800" 
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-transparent"
            }`}
          >
            <div className={`flex items-center gap-2 font-medium mb-1 ${isSelected ? "text-sky-600 dark:text-sky-400" : ""}`}>
              <Icon className="w-4 h-4" /> {opt.label}
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">{opt.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
