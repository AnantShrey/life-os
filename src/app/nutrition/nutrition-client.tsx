"use client";

import { useState } from "react";
import { format, addDays, subDays, startOfWeek, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Target, Calendar as CalendarIcon } from "lucide-react";
import { CalorieRing } from "@/components/nutrition/CalorieRing";
import { MacroRow } from "@/components/nutrition/MacroRow";
import { MealSection } from "@/components/nutrition/MealSection";
import { FoodSearchModal } from "@/components/nutrition/FoodSearchModal";
import { GoalsModal } from "@/components/nutrition/GoalsModal";
import { WeeklyChart } from "@/components/nutrition/WeeklyChart";

export function NutritionClient({ 
  initialLogs, 
  goals,
  weeklyData 
}: { 
  initialLogs: any[]; 
  goals: any;
  weeklyData: any[];
}) {
  const [view, setView] = useState<"today" | "week">("today");
  const [date, setDate] = useState(new Date());
  const [addingTo, setAddingTo] = useState<any>(null);
  const [showGoals, setShowGoals] = useState(false);

  const dateStr = format(date, "yyyy-MM-dd");
  const logs = initialLogs;

  const totals = logs.reduce((acc, log) => ({
    calories: acc.calories + Number(log.calories),
    protein: acc.protein + Number(log.protein_g),
    carbs: acc.carbs + Number(log.carbs_g),
    fat: acc.fat + Number(log.fat_g),
    fiber: acc.fiber + Number(log.fiber_g),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const mealLogs = {
    breakfast: logs.filter(l => l.meal_type === "breakfast"),
    lunch: logs.filter(l => l.meal_type === "lunch"),
    dinner: logs.filter(l => l.meal_type === "dinner"),
    snack: logs.filter(l => l.meal_type === "snack"),
  };

  const changeDate = (days: number) => {
    const newDate = days > 0 ? addDays(date, days) : subDays(date, Math.abs(days));
    setDate(newDate);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {addingTo && (
        <FoodSearchModal 
          mealType={addingTo} 
          date={dateStr} 
          onClose={() => setAddingTo(null)} 
        />
      )}
      {showGoals && (
        <GoalsModal 
          onClose={() => setShowGoals(false)} 
          initialGoals={goals} 
        />
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-muted p-1 rounded-full">
          <button 
            onClick={() => setView("today")}
            className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${view === "today" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-muted-foreground"}`}
          >
            Today
          </button>
          <button 
            onClick={() => setView("week")}
            className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${view === "week" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-muted-foreground"}`}
          >
            This Week
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowGoals(true)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-muted hover:bg-muted/80 px-4 py-2 rounded-full transition-all"
          >
            <Target className="w-3.5 h-3.5" /> Set Goals
          </button>
        </div>
      </div>

      {view === "today" ? (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Date Picker Row */}
          <div className="flex items-center justify-center gap-6">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold">{format(date, "EEEE, MMM d")}</h2>
              {format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Today</span>
              )}
            </div>
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>

          {/* Summary Ring & Macros */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 bg-card p-8 rounded-[32px] border border-border/50 shadow-sm">
            <CalorieRing consumed={totals.calories} goal={goals?.calories || 2000} />
            
            <div className="flex flex-col gap-5">
              <MacroRow label="Protein" consumed={totals.protein} goal={goals?.protein_g || 150} colorClass="bg-blue-500" />
              <MacroRow label="Carbs" consumed={totals.carbs} goal={goals?.carbs_g || 250} colorClass="bg-amber-500" />
              <MacroRow label="Fat" consumed={totals.fat} goal={goals?.fat_g || 65} colorClass="bg-rose-500" />
              <MacroRow label="Fiber" consumed={totals.fiber} goal={goals?.fiber_g || 30} colorClass="bg-green-500" />
            </div>
          </div>

          {/* Meal Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map(m => (
              <MealSection 
                key={m} 
                type={m} 
                items={mealLogs[m]} 
                onAdd={() => setAddingTo(m)} 
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
          <div className="bg-card p-8 rounded-[32px] border border-border/50 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Calorie Consumption</h3>
            <WeeklyChart data={weeklyData} goal={goals?.calories || 2000} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {weeklyData.map((d, i) => {
              const dDate = parseISO(d.date);
              const isToday = format(dDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              return (
                <div 
                  key={d.date} 
                  className={`bg-card p-4 rounded-[20px] flex flex-col items-center gap-2 border transition-all ${isToday ? "border-primary ring-4 ring-primary/10" : "border-border/50"}`}
                >
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">{format(dDate, "EEE")}</span>
                  <span className="text-sm font-bold">{Math.round(d.calories)}</span>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full ${d.calories > (goals?.calories || 2000) ? "bg-red-500" : "bg-primary"}`} 
                      style={{ width: `${Math.min((d.calories / (goals?.calories || 2000)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
