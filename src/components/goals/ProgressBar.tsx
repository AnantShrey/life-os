"use client";
import { useEffect, useState } from "react";

export function ProgressBar({ 
  current, 
  target, 
  colorClass = "bg-sky-500",
  heightClass = "h-2"
}: { 
  current: number; 
  target: number; 
  colorClass?: string;
  heightClass?: string;
}) {
  const [width, setWidth] = useState(0);
  
  const safeTarget = target > 0 ? target : 1;
  const percentage = Math.min(100, Math.max(0, (current / safeTarget) * 100));

  useEffect(() => {
    // Small delay to trigger the CSS transition on mount
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, 50);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClass}`}>
      <div 
        className={`${colorClass} h-full rounded-full transition-all duration-600 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
