"use client";

import { getCategoryConfig, formatCurrency } from "@/lib/expense-utils";
import { format } from "date-fns";

export function BudgetProgressCard({ 
  budgets, 
  expenses, 
  symbol 
}: { 
  budgets: any[]; 
  expenses: any[]; 
  symbol: string 
}) {
  const spentByCategory: Record<string, number> = {};
  expenses.forEach(e => {
    spentByCategory[e.category] = (spentByCategory[e.category] || 0) + Number(e.amount);
  });

  const displayBudgets = budgets.slice(0, 4);
  const overBudgetCount = budgets.filter(b => (spentByCategory[b.category] || 0) > Number(b.amount)).length;

  return (
    <div className="bento-card h-full flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-sm">{format(new Date(), "MMMM yyyy")}</h3>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {displayBudgets.map(b => {
          const spent = spentByCategory[b.category] || 0;
          const pct = Math.min((spent / Number(b.amount)) * 100, 100);
          const cfg = getCategoryConfig(b.category);
          const Icon = cfg.icon;
          const isOver = spent > Number(b.amount);

          return (
            <div key={b.id} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-1.5 font-medium">
                  <Icon className={`w-3 h-3 ${cfg.color}`} />
                  <span className="truncate max-w-[80px]">{b.category}</span>
                </div>
                <span className={isOver ? "text-red-500 font-bold" : "text-muted-foreground"}>
                  {formatCurrency(spent, symbol)} / {formatCurrency(Number(b.amount), symbol)}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isOver ? "bg-red-500" : "bg-primary"} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center py-4">
            <p className="text-xs text-muted-foreground italic">No budgets set for this month</p>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-border/50">
        {overBudgetCount > 0 ? (
          <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
            ⚠️ {overBudgetCount} {overBudgetCount === 1 ? 'category' : 'categories'} over budget
          </p>
        ) : budgets.length > 0 ? (
          <p className="text-[11px] font-bold text-green-500 uppercase tracking-wider">
            ✓ All within budget
          </p>
        ) : null}
      </div>
    </div>
  );
}
