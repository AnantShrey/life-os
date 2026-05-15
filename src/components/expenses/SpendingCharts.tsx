"use client";
import { useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  AreaChart, Area, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import { CATEGORIES, formatCurrency, getDaysInMonth, getCategoryConfig } from "@/lib/expense-utils";

type Expense = { amount: number; category: string; date: string };
type Budget = { category: string; amount: number };

const TABS = ["Breakdown", "Budget vs Actual", "Timeline"] as const;

export function SpendingCharts({
  expenses, budgets, symbol, month, year,
}: {
  expenses: Expense[]; budgets: Budget[]; symbol: string; month: number; year: number;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Breakdown");

  // --- Donut data ---
  const byCategory: Record<string, number> = {};
  for (const e of expenses) byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  const donutData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value, hex: getCategoryConfig(name).hex }))
    .sort((a, b) => b.value - a.value);
  const total = donutData.reduce((s, d) => s + d.value, 0);

  // --- Bar chart data ---
  const allCats = new Set([...Object.keys(byCategory), ...budgets.map(b => b.category)]);
  const barData = [...allCats].map(cat => ({
    name: cat.length > 10 ? cat.slice(0, 10) + "…" : cat,
    fullName: cat,
    spent: byCategory[cat] || 0,
    budget: budgets.find(b => b.category === cat)?.amount || 0,
    hex: getCategoryConfig(cat).hex,
  })).filter(d => d.spent > 0 || d.budget > 0);

  // --- Timeline data ---
  const daysInMonth = getDaysInMonth(year, month);
  const dailySpend: Record<number, number> = {};
  for (const e of expenses) {
    const day = parseInt(e.date.split("-")[2]);
    dailySpend[day] = (dailySpend[day] || 0) + e.amount;
  }
  let cumulative = 0;
  const timelineData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    cumulative += dailySpend[day] || 0;
    return { day, daily: dailySpend[day] || 0, cumulative };
  });
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const dailyBudgetAvg = totalBudget > 0 ? totalBudget / daysInMonth : 0;

  const tooltipStyle = {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: 12, fontSize: 12,
  };

  return (
    <div className="bento-card">
      {/* Tab switcher */}
      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex bg-muted rounded-[14px] p-1 gap-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-[10px] text-sm font-medium transition-all ${
                tab === t ? "bg-white dark:bg-slate-700 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Donut */}
      {tab === "Breakdown" && (
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={donutData.length ? donutData : [{ name: "Empty", value: 1, hex: "#e2e8f0" }]}
                  cx="50%" cy="50%" innerRadius={56} outerRadius={80}
                  dataKey="value" paddingAngle={donutData.length > 1 ? 2 : 0}>
                  {(donutData.length ? donutData : [{ hex: "#e2e8f0" }]).map((d, i) => (
                    <Cell key={i} fill={d.hex} strokeWidth={0} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold">{formatCurrency(total, symbol)}</span>
              <span className="text-xs text-muted-foreground">total</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {donutData.slice(0, 6).map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.hex }} />
                <span className="flex-1 truncate">{d.name}</span>
                <span className="font-semibold">{formatCurrency(d.value, symbol)}</span>
                <span className="text-muted-foreground text-xs w-10 text-right">
                  {total > 0 ? `${Math.round((d.value/total)*100)}%` : "0%"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar */}
      {tab === "Budget vs Actual" && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barCategoryGap="30%">
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={50}
              tickFormatter={v => `${symbol}${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} />
            <Tooltip contentStyle={tooltipStyle}
              formatter={(v, n) => [formatCurrency(Number(v), symbol), n]} />
            <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[4,4,0,0]} />
            {barData.map((d, i) => null)}
            <Bar dataKey="spent" name="Spent" radius={[4,4,0,0]}>
              {barData.map((d, i) => <Cell key={i} fill={d.hex} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Timeline */}
      {tab === "Timeline" && (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={50}
              tickFormatter={v => `${symbol}${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} />
            <Tooltip contentStyle={tooltipStyle}
              formatter={(v, n) => [formatCurrency(Number(v), symbol), n]} />
            {dailyBudgetAvg > 0 && (
              <ReferenceLine y={dailyBudgetAvg} stroke="#f59e0b" strokeDasharray="4 4"
                label={{ value: "Daily avg", position: "right", fontSize: 10 }} />
            )}
            <Area type="monotone" dataKey="cumulative" name="Cumulative"
              stroke="#0ea5e9" fill="url(#areaGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
