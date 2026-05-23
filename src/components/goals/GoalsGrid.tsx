"use client";
import { useState, useMemo } from "react";
import { Target } from "lucide-react";
import { GoalCard, Goal } from "./GoalCard";
import { Milestone } from "./MilestoneList";
import { CreateGoalModal } from "./CreateGoalModal";

export function GoalsGrid({ 
  goals, 
  milestones 
}: { 
  goals: Goal[]; 
  milestones: Milestone[]; 
}) {
  const [timeframe, setTimeframe] = useState("this_month");
  const [category, setCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const TIMEFRAMES = [
    { id: "this_week", label: "This Week" },
    { id: "this_month", label: "This Month" },
    { id: "this_year", label: "This Year" },
    { id: "overall", label: "Overall" }
  ];

  const CATEGORIES = [
    { id: "all", label: "All" },
    { id: "health_fitness", label: "🏃 Health" },
    { id: "learning", label: "📚 Learning" },
    { id: "career", label: "💼 Career" },
    { id: "personal", label: "🙋 Personal" },
    { id: "finance", label: "💰 Finance" },
    { id: "relationships", label: "❤️ Relationships" },
    { id: "other", label: "✨ Other" }
  ];

  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      if (g.timeframe !== timeframe) return false;
      if (category !== "all" && g.category !== category) return false;
      return true;
    });
  }, [goals, timeframe, category]);

  const sortedGoals = useMemo(() => {
    return [...filteredGoals].sort((a, b) => {
      // Completed go to bottom
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      
      // If neither or both are completed, sort by in-progress vs not-started
      const aProgress = a.current_value && a.current_value > 0;
      const bProgress = b.current_value && b.current_value > 0;
      if (aProgress && !bProgress) return -1;
      if (!aProgress && bProgress) return 1;

      // Lastly, sort by created_at desc (we don't have created_at in the type yet, so fallback to id or title)
      return b.title.localeCompare(a.title);
    });
  }, [filteredGoals]);

  const totalGoals = filteredGoals.length;
  const completedGoals = filteredGoals.filter(g => g.completed).length;
  const progressPercent = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[16px] w-full max-w-[600px]">
        {TIMEFRAMES.map(tf => {
          const tfGoals = goals.filter(g => g.timeframe === tf.id);
          const activeCount = tfGoals.filter(g => !g.completed).length;
          const isSel = timeframe === tf.id;
          
          return (
            <button 
              key={tf.id} 
              onClick={() => setTimeframe(tf.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-[12px] text-[13px] transition-all ${
                isSel ? "bg-white dark:bg-slate-700 shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeCount > 0 ? (isSel ? "bg-sky-500 text-white" : "bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400") : "bg-slate-200 dark:bg-slate-600 text-muted-foreground"
              }`}>
                {tfGoals.length}
              </span>
            </button>
          )
        })}
      </div>

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-5 rounded-[20px] shadow-sm">
        <div className="flex-1 max-w-[400px]">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {completedGoals} of {totalGoals} goals completed
          </p>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sky-500 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>
        
        <button 
          onClick={() => { setEditingGoal(null); setShowModal(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-[12px] text-[13px] font-medium text-white shadow-sm hover:brightness-110 transition-all flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}
        >
          <Target className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide gap-2">
        {CATEGORIES.map(c => {
          const isSel = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-[20px] text-[13px] transition-all border ${
                isSel 
                  ? "bg-sky-500 border-sky-500 text-white font-medium" 
                  : "bg-transparent border-slate-200 dark:border-slate-700 text-muted-foreground hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {sortedGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-card/50 rounded-[24px] border border-border/50 border-dashed">
          <Target className="w-10 h-10 text-muted-foreground/50 mb-2" />
          <h3 className="font-semibold text-lg">No goals found</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            You don't have any goals for this timeframe and category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGoals.map(g => (
            <GoalCard 
              key={g.id} 
              goal={g} 
              milestones={milestones.filter(m => m.goal_id === g.id)}
              onEdit={(goal) => { setEditingGoal(goal); setShowModal(true); }}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateGoalModal 
          onClose={() => setShowModal(false)} 
          initialData={editingGoal} 
        />
      )}

    </div>
  );
}
