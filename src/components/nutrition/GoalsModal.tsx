"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { saveNutritionGoals } from "@/app/nutrition/actions";

const INPUT = "w-full bg-muted border border-border rounded-[12px] px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all";

export function GoalsModal({ onClose, initialGoals }: { onClose: () => void; initialGoals: any }) {
  const [goals, setGoals] = useState({
    calories: initialGoals?.calories || 2000,
    protein_g: initialGoals?.protein_g || 150,
    carbs_g: initialGoals?.carbs_g || 250,
    fat_g: initialGoals?.fat_g || 65,
    fiber_g: initialGoals?.fiber_g || 30,
  });
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await saveNutritionGoals(goals);
      onClose();
    });
  };

  const setPreset = (type: string) => {
    if (type === "loss") setGoals({ calories: 1600, protein_g: 160, carbs_g: 150, fat_g: 50, fiber_g: 30 });
    if (type === "maint") setGoals({ calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65, fiber_g: 30 });
    if (type === "gain") setGoals({ calories: 2500, protein_g: 180, carbs_g: 280, fat_g: 80, fiber_g: 35 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
      <div className="bg-card w-full max-w-[420px] rounded-[24px] p-6 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Daily Nutrition Goals</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* Presets */}
        <div className="flex gap-2">
          {["loss", "maint", "gain"].map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className="flex-1 text-[10px] font-bold uppercase tracking-wider py-2 bg-muted hover:bg-primary/10 hover:text-primary rounded-[10px] transition-all"
            >
              {p === "loss" ? "Weight Loss" : p === "maint" ? "Maintenance" : "Muscle Gain"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Calories (kcal)</label>
            <input 
              type="number" 
              value={goals.calories} 
              onChange={e => setGoals({ ...goals, calories: Number(e.target.value) })}
              className={INPUT} 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Protein (g)</label>
            <input type="number" value={goals.protein_g} onChange={e => setGoals({ ...goals, protein_g: Number(e.target.value) })} className={INPUT} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Carbs (g)</label>
            <input type="number" value={goals.carbs_g} onChange={e => setGoals({ ...goals, carbs_g: Number(e.target.value) })} className={INPUT} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fat (g)</label>
            <input type="number" value={goals.fat_g} onChange={e => setGoals({ ...goals, fat_g: Number(e.target.value) })} className={INPUT} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fiber (g)</label>
            <input type="number" value={goals.fiber_g} onChange={e => setGoals({ ...goals, fiber_g: Number(e.target.value) })} className={INPUT} />
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isPending}
          className="w-full bg-primary text-white py-3 rounded-[14px] font-bold hover:brightness-110 transition-all shadow-md"
        >
          {isPending ? "Saving..." : "Save Goals"}
        </button>
      </div>
    </div>
  );
}
