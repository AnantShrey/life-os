"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { X, Search, Plus } from "lucide-react";
import { searchFood, mapFoodItem } from "@/lib/open-food-facts";
import { addNutritionLog } from "@/app/nutrition/actions";

const INPUT = "w-full bg-muted border border-border rounded-[12px] px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all";

export function FoodSearchModal({ 
  onClose, 
  mealType, 
  date 
}: { 
  onClose: () => void; 
  mealType: "breakfast" | "lunch" | "dinner" | "snack"; 
  date: string 
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [serving, setServing] = useState(100);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim()) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      const res = await searchFood(query);
      setResults(res);
    }, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  const handleAdd = () => {
    if (!selected) return;
    const mapped = mapFoodItem(selected, serving);
    startTransition(async () => {
      await addNutritionLog({
        ...mapped,
        meal_type: mealType,
        log_date: date,
      });
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
      <div className="bg-card w-full max-w-[540px] max-h-[85vh] rounded-[24px] flex flex-col overflow-hidden shadow-2xl">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input 
            autoFocus 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search for ${mealType} foods...`} 
            className="flex-1 bg-transparent text-base outline-none" 
          />
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="p-2">
              {results.map((product) => (
                <button 
                  key={product.id}
                  onClick={() => setSelected(product)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-[12px] text-left transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-medium text-sm truncate">{product.product_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{product.brands || "Generic"}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold">{Math.round(product.nutriments?.["energy-kcal_100g"] || 0)} kcal</p>
                    <p className="text-[10px] text-muted-foreground uppercase">per 100g</p>
                  </div>
                </button>
              ))}
              {query && results.length === 0 && (
                <p className="text-center py-10 text-muted-foreground text-sm">No food found.</p>
              )}
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-6">
              <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline self-start">← Back to search</button>
              
              <div>
                <h3 className="text-lg font-bold">{selected.product_name}</h3>
                <p className="text-sm text-muted-foreground">{selected.brands}</p>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Serving Size (grams)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={serving} 
                    onChange={e => setServing(Number(e.target.value))}
                    className={`${INPUT} w-32 text-center`}
                  />
                  <span className="text-sm font-medium">grams</span>
                </div>
              </div>

              {/* Recalculated macros preview */}
              <div className="grid grid-cols-4 gap-2 bg-muted/50 p-4 rounded-[16px]">
                {[
                  { l: "Calories", v: mapFoodItem(selected, serving).calories, u: "kcal" },
                  { l: "Protein", v: mapFoodItem(selected, serving).protein_g, u: "g" },
                  { l: "Carbs", v: mapFoodItem(selected, serving).carbs_g, u: "g" },
                  { l: "Fat", v: mapFoodItem(selected, serving).fat_g, u: "g" },
                ].map(m => (
                  <div key={m.l} className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{m.l}</p>
                    <p className="text-sm font-bold">{m.v}{m.u}</p>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleAdd}
                disabled={isPending}
                className="w-full bg-primary text-white py-3 rounded-[14px] font-bold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isPending ? "Adding..." : `Add to ${mealType}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
