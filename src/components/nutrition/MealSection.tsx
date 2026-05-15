"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2, Coffee, Utensils, Moon, Apple } from "lucide-react";
import { deleteNutritionLog } from "@/app/nutrition/actions";
import { useTransition } from "react";

const MEAL_ICONS = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Moon,
  snack: Apple,
};

export function MealSection({ 
  type, 
  items, 
  onAdd 
}: { 
  type: "breakfast" | "lunch" | "dinner" | "snack"; 
  items: any[]; 
  onAdd: () => void 
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPending, startTransition] = useTransition();
  const Icon = MEAL_ICONS[type];
  const totalCals = items.reduce((sum, item) => sum + Number(item.calories), 0);

  return (
    <div className="bg-card border border-border/50 rounded-[20px] overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-semibold capitalize">{type}</h3>
          <span className="text-sm text-muted-foreground">{Math.round(totalCals)} kcal</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 flex flex-col gap-1">
          {items.map((item) => (
            <div key={item.id} className="group flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.food_name}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{item.serving_size}</span>
                  <span>P: {Math.round(item.protein_g)}g</span>
                  <span>C: {Math.round(item.carbs_g)}g</span>
                  <span>F: {Math.round(item.fat_g)}g</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{Math.round(item.calories)} kcal</span>
                <button 
                  onClick={() => startTransition(() => deleteNutritionLog(item.id))}
                  className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  disabled={isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={onAdd}
            className="flex items-center gap-2 text-xs text-primary font-medium mt-3 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add Food
          </button>
        </div>
      )}
    </div>
  );
}
