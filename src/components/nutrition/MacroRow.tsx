"use client";

export function MacroRow({ label, consumed, goal, colorClass }: { label: string; consumed: number; goal: number; colorClass: string }) {
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <div className="flex justify-between items-end text-xs">
        <span className="font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="font-semibold">{Math.round(consumed)}g / {goal}g</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} rounded-full transition-all duration-500`} 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
}
