"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getCategoryConfig, formatCurrency } from "@/lib/expense-utils";

export function SpendingDonutCard({ 
  expenses, 
  budgets, 
  symbol 
}: { 
  expenses: any[]; 
  budgets: any[]; 
  symbol: string 
}) {
  const byCategory: Record<string, number> = {};
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
  });

  const totalSpent = Object.values(byCategory).reduce((a, b) => a + b, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  
  const sorted = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a);
    
  const top4 = sorted.slice(0, 4);
  const otherSum = sorted.slice(4).reduce((sum, [, val]) => sum + val, 0);
  
  const data = top4.map(([name, value]) => ({
    name,
    value,
    hex: getCategoryConfig(name).hex
  }));
  
  if (otherSum > 0) {
    data.push({ name: "Other", value: otherSum, hex: "#64748b" });
  }

  const isOver = totalBudget > 0 && totalSpent > totalBudget;

  return (
    <div className="bento-card h-full flex flex-col items-center justify-between">
      <div className="relative w-full aspect-square max-w-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length ? data : [{ value: 1 }]}
              cx="50%" cy="50%"
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={data.length > 1 ? 4 : 0}
              dataKey="value"
              stroke="none"
            >
              {data.length ? data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.hex} />
              )) : <Cell fill="var(--muted)" />}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className={`text-xl font-bold ${isOver ? "text-red-500" : ""}`}>
            {formatCurrency(totalSpent, symbol)}
          </p>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">spent</p>
        </div>
      </div>
      
      <div className="w-full text-center mt-2">
        <p className="text-xs text-muted-foreground">
          {format(new Date(), "MMMM")} • {totalBudget > 0 ? `of ${formatCurrency(totalBudget, symbol)} budget` : "No budget set"}
        </p>
      </div>
    </div>
  );
}

import { format } from "date-fns";
