"use client";

export function CalorieRingCard({ consumed, goal }: { consumed: number; goal: number }) {
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const over = consumed > goal;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="bento-card h-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative w-[150px] h-[150px] flex items-center justify-center">
        <svg width="140" height="140" className="transform -rotate-90">
          <circle
            cx="70" cy="70" r={radius}
            stroke="currentColor" strokeWidth="12" fill="transparent"
            className="text-muted/30"
          />
          <circle
            cx="70" cy="70" r={radius}
            stroke={over ? "#ef4444" : "#0ea5e9"}
            strokeWidth="12" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className={`text-2xl font-bold ${over ? "text-red-500" : ""}`}>{consumed.toLocaleString()}</p>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">kcal</p>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-xs text-muted-foreground">Goal: {goal.toLocaleString()} kcal</p>
        {over && <p className="text-[10px] text-red-500 font-bold mt-1">EXCEEDED</p>}
      </div>
    </div>
  );
}
