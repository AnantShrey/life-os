"use client";

export function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const over = consumed > goal;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx="90" cy="90" r={radius}
          stroke="currentColor" strokeWidth="14" fill="transparent"
          className="text-muted/30"
        />
        {/* Progress bar */}
        <circle
          cx="90" cy="90" r={radius}
          stroke={over ? "#ef4444" : "#0ea5e9"}
          strokeWidth="14" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-2xl font-bold">{consumed.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">of {goal.toLocaleString()} kcal</p>
      </div>
    </div>
  );
}
