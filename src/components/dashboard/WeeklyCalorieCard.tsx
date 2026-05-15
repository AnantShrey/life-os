"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, Cell } from "recharts";
import { format, parseISO } from "date-fns";

export function WeeklyCalorieCard({ data, goal }: { data: any[]; goal: number }) {
  const chartData = data.map(d => ({
    date: d.date,
    day: format(parseISO(d.date), "EEE").charAt(0),
    calories: d.calories,
  }));

  return (
    <div className="bento-card h-full flex flex-col gap-3">
      <h3 className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground">Weekly Trend</h3>
      <div className="flex-1 min-h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="day" 
              hide 
            />
            <Bar dataKey="calories" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.calories > goal ? "#ef4444" : "#0ea5e9"} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase px-1">
        {chartData.map(d => <span key={d.date}>{d.day}</span>)}
      </div>
    </div>
  );
}
