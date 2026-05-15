"use client";

import { AreaChart, Area, ResponsiveContainer, ReferenceLine, XAxis, YAxis } from "recharts";
import { getDaysInMonth, formatCurrency } from "@/lib/expense-utils";
import { format, differenceInDays, startOfMonth, endOfMonth } from "date-fns";

export function SpendingTimelineCard({ 
  expenses, 
  budgets, 
  symbol 
}: { 
  expenses: any[]; 
  budgets: any[]; 
  symbol: string 
}) {
  const now = new Date();
  const daysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth() + 1);
  const daysElapsed = now.getDate();
  const daysLeft = daysInMonth - daysElapsed;

  const dailySpend: Record<number, number> = {};
  expenses.forEach(e => {
    const day = new Date(e.date).getDate();
    dailySpend[day] = (dailySpend[day] || 0) + Number(e.amount);
  });

  let cumulative = 0;
  const data = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    cumulative += dailySpend[day] || 0;
    return { day, cumulative };
  }).filter(d => d.day <= daysElapsed);

  const totalSpent = data[data.length - 1]?.cumulative || 0;
  const projected = daysElapsed > 0 ? (totalSpent / daysElapsed) * daysInMonth : 0;
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const dailyBudgetAvg = totalBudget > 0 ? totalBudget / daysInMonth : 0;

  return (
    <div className="bento-card h-full flex flex-col gap-4">
      <div className="flex-1 min-h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" hide />
            <YAxis hide domain={[0, Math.max(projected, totalBudget || 0) * 1.1]} />
            {dailyBudgetAvg > 0 && (
              <ReferenceLine y={dailyBudgetAvg * daysElapsed} stroke="#f59e0b" strokeDasharray="3 3" />
            )}
            <Area 
              type="monotone" 
              dataKey="cumulative" 
              stroke="#0ea5e9" 
              strokeWidth={2}
              fill="url(#spendGrad)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          {daysLeft} days left this month
        </p>
        <p className="text-xs">
          Projected total: <span className="font-bold italic">{formatCurrency(projected, symbol)}</span>
        </p>
      </div>
    </div>
  );
}
