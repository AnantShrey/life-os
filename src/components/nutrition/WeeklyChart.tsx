"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format, parseISO } from "date-fns";

export function WeeklyChart({ data, goal }: { data: any[]; goal: number }) {
  const chartData = data.map(d => ({
    day: format(parseISO(d.date), "EEE"),
    calories: d.calories,
  }));

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: "12px", 
              border: "1px solid var(--border)", 
              backgroundColor: "var(--card)",
              fontSize: "12px"
            }} 
          />
          <ReferenceLine y={goal} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Goal', position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }} />
          <Area 
            type="monotone" 
            dataKey="calories" 
            stroke="#0ea5e9" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCal)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
