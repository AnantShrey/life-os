"use client";
import { useState, useTransition } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { GoalType, GoalTypeSelector } from "./GoalTypeSelector";
import { createGoal, updateGoal } from "@/app/goals/actions";

const GOAL_COLORS = [
  { value: 'default', bg: 'bg-slate-200 dark:bg-slate-700', ring: 'ring-slate-400', label: 'Default' },
  { value: 'red',     bg: 'bg-red-400',    ring: 'ring-red-400',    label: 'Red' },
  { value: 'orange',  bg: 'bg-orange-400', ring: 'ring-orange-400', label: 'Orange' },
  { value: 'yellow',  bg: 'bg-yellow-400', ring: 'ring-yellow-400', label: 'Yellow' },
  { value: 'green',   bg: 'bg-green-400',  ring: 'ring-green-400',  label: 'Green' },
  { value: 'teal',    bg: 'bg-teal-400',   ring: 'ring-teal-400',   label: 'Teal' },
  { value: 'blue',    bg: 'bg-blue-400',   ring: 'ring-blue-400',   label: 'Blue' },
  { value: 'purple',  bg: 'bg-purple-400', ring: 'ring-purple-400', label: 'Purple' },
  { value: 'pink',    bg: 'bg-pink-400',   ring: 'ring-pink-400',   label: 'Pink' },
];

const CATEGORIES = [
  { id: "health_fitness", label: "Health", icon: "🏃" },
  { id: "learning", label: "Learning", icon: "📚" },
  { id: "career", label: "Career", icon: "💼" },
  { id: "personal", label: "Personal", icon: "🙋" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "relationships", label: "Relationships", icon: "❤️" },
  { id: "other", label: "Other", icon: "✨" }
];

const MODULE_OPTIONS = [
  { id: "", label: "None (manual tracking)" },
  { id: "books:books_finished", label: "📚 Books — books finished" },
  { id: "books:books_read_pages", label: "📚 Books — pages read" },
  { id: "habits:habits_streak", label: "◎ Habits — highest streak" },
  { id: "habits:perfect_days", label: "◎ Habits — perfect days" },
  { id: "tasks:tasks_completed", label: "✓ Tasks — tasks completed" },
  { id: "nutrition:calories_avg", label: "🥗 Nutrition — average daily calories" },
  { id: "nutrition:protein_avg", label: "🥗 Nutrition — average daily protein" },
  { id: "expenses:total_spent", label: "💸 Expenses — total spent" },
  { id: "watchlist:titles_watched", label: "🎬 Watchlist — titles watched" }
];

export function CreateGoalModal({ 
  onClose,
  initialData,
}: { 
  onClose: () => void;
  initialData?: any;
}) {
  const isEditing = !!initialData;
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState<GoalType>(initialData?.type || "checklist");
  const [timeframe, setTimeframe] = useState(initialData?.timeframe || "this_month");
  const [category, setCategory] = useState(initialData?.category || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [color, setColor] = useState(initialData?.color || "blue");
  const [icon, setIcon] = useState(initialData?.icon || "");
  
  // Progress specific
  const [targetValue, setTargetValue] = useState(initialData?.target_value?.toString() || "");
  const [currentValue, setCurrentValue] = useState(initialData?.current_value?.toString() || "");
  const [unit, setUnit] = useState(initialData?.unit || "");
  const initialLinkedStr = initialData?.linked_module ? `${initialData.linked_module}:${initialData.linked_metric}` : "";
  const [linkedModuleStr, setLinkedModuleStr] = useState(initialLinkedStr);
  
  // Milestone specific
  const [milestones, setMilestones] = useState<string[]>([]);
  const [newMilestone, setNewMilestone] = useState("");
  
  // Dates
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(initialData?.start_date || todayStr);
  const [endDate, setEndDate] = useState(initialData?.end_date || "");
  
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    if (!title.trim()) return;
    
    let linked_module = null;
    let linked_metric = null;
    if (linkedModuleStr) {
      const parts = linkedModuleStr.split(":");
      linked_module = parts[0];
      linked_metric = parts[1];
    }
    
    const payload = {
      title,
      type,
      timeframe,
      category: category || null,
      description: description || null,
      color,
      icon: icon || null,
      start_date: startDate,
      end_date: endDate || null,
      
      target_value: type === "progress" && targetValue ? parseFloat(targetValue) : null,
      current_value: type === "progress" && currentValue ? parseFloat(currentValue) : 0,
      unit: type === "progress" ? (unit || null) : null,
      linked_module,
      linked_metric
    };

    startTransition(async () => {
      if (isEditing) {
        await updateGoal(initialData.id, payload);
      } else {
        await createGoal(payload, type === "milestone" ? milestones : undefined);
      }
      onClose();
    });
  };

  const INPUT = "w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[12px] px-[14px] py-[10px] text-[14px] focus:outline-none focus:border-sky-500 focus:ring-[3px] focus:ring-sky-500/15 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
      <div className="bg-card w-full max-w-[560px] max-h-[85vh] rounded-[24px] flex flex-col overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.25)]">
        
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #475569; }
        `}</style>
        
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">{isEditing ? "Edit Goal" : "New Goal"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-5 flex flex-col gap-6">
          
          {/* 1. Title */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5">Goal Title *</label>
            <input 
              autoFocus value={title} onChange={e => setTitle(e.target.value)}
              placeholder="What do you want to achieve?" 
              className={`${INPUT} text-[16px]`} 
            />
          </div>

          {/* 2. Type Selector */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5">Goal Type *</label>
            <GoalTypeSelector selected={type} onChange={setType} />
          </div>

          {/* 3. Timeframe */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5">Timeframe</label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-[12px] w-full sm:w-max">
              {["this_week", "this_month", "this_year", "overall"].map(tf => {
                const isSel = timeframe === tf;
                return (
                  <button key={tf} onClick={() => setTimeframe(tf)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all ${isSel ? "bg-white dark:bg-slate-700 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {tf.replace("_", " ")}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 4. Category */}
            <div>
              <label className="block text-[13px] font-medium mb-1.5">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={INPUT}>
                <option value="">No category</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            
            {/* 7. Icon */}
            <div>
              <label className="block text-[13px] font-medium mb-1.5">Icon / Emoji</label>
              <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="e.g. 🎯" className={INPUT} maxLength={5} />
            </div>
          </div>

          {/* 5. Description */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add more detail about this goal..." rows={2} className={`${INPUT} resize-none`} />
          </div>

          {/* 6. Color */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5">Color</label>
            <div className="flex flex-wrap gap-3">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`
                    w-8 h-8 rounded-full ${c.bg}
                    transition-all duration-150 ring-offset-card
                    ${color === c.value
                      ? `ring-2 ring-offset-2 ${c.ring} scale-110`
                      : 'hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-slate-300 dark:hover:ring-slate-600'
                    }
                  `}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* 8. Progress Type Conditional Fields */}
          {type === "progress" && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[16px] flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-medium mb-1">Target *</label>
                  <input type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)} placeholder="e.g. 12" className={INPUT} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1">Unit</label>
                  <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="books, km..." className={INPUT} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1">Start val.</label>
                  <input type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} placeholder="0" className={INPUT} />
                </div>
              </div>
              
              <div>
                <label className="block text-[12px] font-medium mb-1">Auto-track from a module (optional)</label>
                <select value={linkedModuleStr} onChange={e => setLinkedModuleStr(e.target.value)} className={INPUT}>
                  {MODULE_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
                {linkedModuleStr && (
                  <p className="text-[11px] text-muted-foreground italic mt-2">
                    Progress will be automatically calculated from your {linkedModuleStr.split(":")[0]} data.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 9. Milestone Type Conditional Fields */}
          {type === "milestone" && !isEditing && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[16px]">
              <label className="block text-[13px] font-medium mb-2">Milestones</label>
              <div className="flex flex-col gap-2">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-[8px] text-[13px]">{m}</div>
                    <button onClick={() => setMilestones(milestones.filter((_, idx) => idx !== i))} className="p-1.5 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-1">
                  <input value={newMilestone} onChange={e => setNewMilestone(e.target.value)} onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); if (newMilestone.trim()) { setMilestones([...milestones, newMilestone.trim()]); setNewMilestone(""); } }
                  }} placeholder="Add a milestone..." className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[8px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-sky-500" />
                  <button onClick={() => { if (newMilestone.trim()) { setMilestones([...milestones, newMilestone.trim()]); setNewMilestone(""); } }} className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded text-foreground"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          )}
          {type === "milestone" && isEditing && (
            <p className="text-xs text-muted-foreground italic">Milestones can be edited directly on the goal card.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1.5">Target Date <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={INPUT} />
            </div>
          </div>
          
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-3 bg-muted/30">
          <button onClick={onClose} className="px-5 py-2 rounded-[12px] text-[13px] font-medium border border-border hover:bg-muted transition-colors">
            Cancel
          </button>
          <button 
            disabled={pending || !title.trim()}
            onClick={handleSave}
            className="px-5 py-2 rounded-[12px] text-[13px] font-medium text-white shadow-sm hover:brightness-110 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}
          >
            {pending ? "Saving..." : isEditing ? "Save Changes" : "Create Goal"}
          </button>
        </div>

      </div>
    </div>
  );
}
