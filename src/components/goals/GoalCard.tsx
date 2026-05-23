"use client";
import { useState, useTransition } from "react";
import { GoalType } from "./GoalTypeSelector";
import { MilestoneList, Milestone } from "./MilestoneList";
import { ProgressBar } from "./ProgressBar";
import { CheckCircle2, MoreHorizontal, Pencil, Trash2, CheckSquare, BarChart2, Flag } from "lucide-react";
import { toggleGoalCompletion, deleteGoal, updateGoal } from "@/app/goals/actions";

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  timeframe: string;
  type: GoalType;
  category: string | null;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  completed: boolean;
  linked_module: string | null;
  color: string;
  icon: string | null;
  end_date: string | null;
};

const COLOR_MAP: Record<string, { border: string; bg: string; fill: string }> = {
  blue:   { border: "border-blue-200 dark:border-blue-800", bg: "bg-blue-50/50 dark:bg-blue-950/20", fill: "bg-blue-500" },
  green:  { border: "border-green-200 dark:border-green-800", bg: "bg-green-50/50 dark:bg-green-950/20", fill: "bg-green-500" },
  purple: { border: "border-purple-200 dark:border-purple-800", bg: "bg-purple-50/50 dark:bg-purple-950/20", fill: "bg-purple-500" },
  red:    { border: "border-red-200 dark:border-red-800", bg: "bg-red-50/50 dark:bg-red-950/20", fill: "bg-red-500" },
  orange: { border: "border-orange-200 dark:border-orange-800", bg: "bg-orange-50/50 dark:bg-orange-950/20", fill: "bg-orange-500" },
  yellow: { border: "border-yellow-200 dark:border-yellow-800", bg: "bg-yellow-50/50 dark:bg-yellow-950/20", fill: "bg-yellow-500" },
  teal:   { border: "border-teal-200 dark:border-teal-800", bg: "bg-teal-50/50 dark:bg-teal-950/20", fill: "bg-teal-500" },
  pink:   { border: "border-pink-200 dark:border-pink-800", bg: "bg-pink-50/50 dark:bg-pink-950/20", fill: "bg-pink-500" },
  default:{ border: "border-slate-200 dark:border-slate-700", bg: "bg-slate-50/50 dark:bg-slate-900/20", fill: "bg-sky-500" }
};

const CATEGORY_MAP: Record<string, { label: string, icon: string }> = {
  health_fitness: { label: "Health", icon: "🏃" },
  learning: { label: "Learning", icon: "📚" },
  career: { label: "Career", icon: "💼" },
  personal: { label: "Personal", icon: "🙋" },
  finance: { label: "Finance", icon: "💰" },
  relationships: { label: "Relationships", icon: "❤️" },
  other: { label: "Other", icon: "✨" }
};

export function GoalCard({ 
  goal, 
  milestones = [],
  onEdit
}: { 
  goal: Goal; 
  milestones?: Milestone[];
  onEdit: (g: Goal) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateVal, setUpdateVal] = useState(goal.current_value?.toString() || "0");
  const [pending, startTransition] = useTransition();

  const c = COLOR_MAP[goal.color] || COLOR_MAP.default;
  const isCompleted = goal.completed;
  
  const handleToggleComplete = () => {
    startTransition(() => {
      toggleGoalCompletion(goal.id, !isCompleted);
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this goal?")) {
      startTransition(() => {
        deleteGoal(goal.id);
      });
    }
  };

  const handleSaveProgress = () => {
    const val = parseFloat(updateVal);
    if (!isNaN(val)) {
      startTransition(() => {
        updateGoal(goal.id, { current_value: val });
        setShowUpdate(false);
      });
    }
  };

  const isOverdue = goal.end_date && !isCompleted && new Date(goal.end_date) < new Date();

  // Completed style override
  const cardBorder = isCompleted ? "border-green-200 dark:border-green-800" : c.border;
  const cardBg = isCompleted ? "bg-green-50/40 dark:bg-green-950/20" : c.bg;

  return (
    <div 
      className={`relative rounded-[20px] p-5 border transition-all duration-200 ${cardBorder} ${cardBg} ${isCompleted ? "opacity-70" : ""}`}
      style={{ 
        boxShadow: isHovered && !isCompleted ? "0 8px 24px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.02)",
        transform: isHovered && !isCompleted ? "translateY(-2px)" : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      {isCompleted && (
        <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 pr-20">
          {goal.icon && <span className="text-xl leading-none">{goal.icon}</span>}
          <h3 className={`text-[16px] font-semibold leading-tight ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {goal.title}
          </h3>
        </div>
        
        {!isCompleted && (
          <div className="flex items-center gap-2 relative">
            {goal.category && CATEGORY_MAP[goal.category] && (
              <span className="flex items-center gap-1 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-[11px] px-2 py-0.5 rounded-full font-medium">
                {CATEGORY_MAP[goal.category].icon} {CATEGORY_MAP[goal.category].label}
              </span>
            )}
            
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`p-1 rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${isHovered ? "opacity-100" : "opacity-0"}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-[10px] shadow-lg py-1 min-w-[120px] z-20 text-[13px]">
                <button onClick={() => { onEdit(goal); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-muted text-left">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 text-left">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeframe & Dates */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="bg-slate-100 dark:bg-slate-800 text-[11px] font-medium px-2 py-0.5 rounded-full capitalize">
          {goal.timeframe.replace("_", " ")}
        </span>
        {goal.end_date && (
          <span className={`text-[12px] ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
            Target: {new Date(goal.end_date).toLocaleDateString()}
            {isOverdue && " (Overdue)"}
          </span>
        )}
      </div>

      {/* Body depending on type */}
      <div className="mb-4">
        
        {goal.type === "checklist" && (
          <div className="flex items-start gap-3">
            <button 
              onClick={handleToggleComplete}
              disabled={pending}
              className={`flex-shrink-0 w-6 h-6 rounded-[6px] border-[1.5px] flex items-center justify-center transition-all duration-200 mt-0.5 ${
                isCompleted 
                  ? `${c.fill} border-transparent text-white scale-110` 
                  : "border-slate-300 dark:border-slate-600 hover:border-sky-400 bg-white dark:bg-slate-900"
              }`}
            >
              {isCompleted && <CheckCircle2 className="w-4 h-4" />}
            </button>
            <div className="flex-1">
              <span className="text-[14px] font-medium cursor-pointer select-none" onClick={handleToggleComplete}>
                Mark as complete
              </span>
              {goal.description && (
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                  {goal.description}
                </p>
              )}
            </div>
          </div>
        )}

        {goal.type === "progress" && (
          <div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-[24px] font-bold text-foreground leading-none">
                {goal.current_value || 0}
              </span>
              <span className="text-[14px] text-muted-foreground font-medium">
                / {goal.target_value || 1} {goal.unit}
              </span>
            </div>
            
            <ProgressBar 
              current={goal.current_value || 0} 
              target={goal.target_value || 1} 
              colorClass={c.fill} 
            />
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-[12px] text-muted-foreground font-medium">
                {Math.round(((goal.current_value || 0) / (goal.target_value || 1)) * 100)}% complete
              </span>
              
              {goal.linked_module ? (
                <span className="text-[11px] text-muted-foreground italic flex items-center gap-1 bg-white/40 dark:bg-slate-900/40 px-1.5 py-0.5 rounded-md">
                  🔗 Auto-tracked from {goal.linked_module.charAt(0).toUpperCase() + goal.linked_module.slice(1)}
                </span>
              ) : (
                !isCompleted && (
                  showUpdate ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="number" 
                        value={updateVal} 
                        onChange={e => setUpdateVal(e.target.value)}
                        className="w-16 h-6 bg-white dark:bg-slate-800 border border-border rounded px-1 text-[12px] focus:outline-none focus:border-sky-500"
                      />
                      <button onClick={handleSaveProgress} disabled={pending} className="bg-sky-500 text-white px-2 py-0.5 rounded text-[11px] font-medium hover:bg-sky-600">Save</button>
                      <button onClick={() => setShowUpdate(false)} className="text-[11px] px-1 hover:underline text-muted-foreground">Cancel</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowUpdate(true)}
                      className="text-[11px] font-medium text-sky-600 hover:underline bg-sky-50 dark:bg-sky-900/30 px-2 py-1 rounded-full"
                    >
                      + Update progress
                    </button>
                  )
                )
              )}
            </div>
          </div>
        )}

        {goal.type === "milestone" && (
          <div>
            <MilestoneList milestones={milestones} readonly={false} />
            <div className="mt-3">
              <ProgressBar 
                current={milestones.filter(m => m.completed).length} 
                target={milestones.length || 1} 
                colorClass={c.fill} 
                heightClass="h-1.5"
              />
              <span className="text-[11px] text-muted-foreground mt-1.5 block font-medium">
                {milestones.filter(m => m.completed).length} of {milestones.length} milestones complete
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
