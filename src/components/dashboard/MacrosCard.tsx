"use client";

export function MacrosCard({ 
  protein, 
  carbs, 
  fat, 
  goals 
}: { 
  protein: number; 
  carbs: number; 
  fat: number; 
  goals: any 
}) {
  const macros = [
    { label: "Protein", val: protein, goal: goals?.protein_g || 150, color: "bg-blue-500" },
    { label: "Carbs", val: carbs, goal: goals?.carbs_g || 250, color: "bg-amber-500" },
    { label: "Fat", val: fat, goal: goals?.fat_g || 65, color: "bg-rose-500" },
  ];

  return (
    <div className="bento-card h-full flex flex-col justify-between">
      <div className="flex flex-col gap-6 flex-1 justify-center">
        {macros.map(m => {
          const pct = Math.min((m.val / m.goal) * 100, 100);
          return (
            <div key={m.label} className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</span>
                <span className="text-xs font-bold">{Math.round(m.val)}g / {m.goal}g</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${m.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
