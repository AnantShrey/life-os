"use client";
import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/expense-utils";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { BudgetPanel } from "@/components/expenses/BudgetPanel";
import { SpendingCharts } from "@/components/expenses/SpendingCharts";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";

type Expense = { id: string; amount: number; category: string; description: string; date: string; notes?: string | null; is_recurring?: boolean; recurring_frequency?: string | null };
type Budget = { id: string; category: string; amount: number; month: number; year: number };

const CARD = "bg-card rounded-[20px] p-5 flex flex-col gap-3";
const SHADOW = { boxShadow: "0 1px 2px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04)" };

export function ExpensesClient({ initialExpenses, initialBudgets, symbol, month, year }: {
  initialExpenses: Expense[]; initialBudgets: Budget[]; symbol: string; month: number; year: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(year, month - 1, 1));

  const vm = viewDate.getMonth() + 1;
  const vy = viewDate.getFullYear();

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const expenses = initialExpenses;
  const budgets = initialBudgets;

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const remaining = totalBudget - totalSpent;
  const biggest = expenses.reduce((m, e) => e.amount > (m?.amount ?? 0) ? e : m, expenses[0]);

  return (
    <div className="flex flex-col gap-6">
      {showForm && <ExpenseForm symbol={symbol} onClose={() => setShowForm(false)} />}

      {/* Charts */}
      <style>{`.bento-card{background:var(--card);border-radius:20px;padding:20px 24px;box-shadow:0 1px 2px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04);overflow:hidden}`}</style>
      <SpendingCharts expenses={expenses} budgets={budgets} symbol={symbol} month={vm} year={vy} />

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT — stats */}
        <div className="col-span-12 md:col-span-3 flex flex-col gap-4">
          {/* Month selector */}
          <div className={CARD} style={SHADOW}>
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="p-1.5 hover:bg-muted rounded-full transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <span className="font-semibold text-sm">{format(viewDate, "MMMM yyyy")}</span>
              <button onClick={nextMonth} className="p-1.5 hover:bg-muted rounded-full transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Stats */}
          {[
            { label: "Total spent", value: formatCurrency(totalSpent, symbol), color: "" },
            { label: "Total budget", value: formatCurrency(totalBudget, symbol), color: "" },
            { label: totalBudget ? (remaining >= 0 ? "Remaining" : "Overspent") : "No budget set",
              value: totalBudget ? formatCurrency(Math.abs(remaining), symbol) : "—",
              color: remaining >= 0 ? "text-green-500" : "text-red-500" },
            { label: "Transactions", value: String(expenses.length), color: "" },
          ].map(s => (
            <div key={s.label} className={CARD} style={SHADOW}>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
          {biggest && (
            <div className={CARD} style={SHADOW}>
              <p className="text-xs text-muted-foreground">Biggest expense</p>
              <p className="font-semibold text-sm truncate">{biggest.description}</p>
              <p className="text-lg font-bold text-red-500">{formatCurrency(biggest.amount, symbol)}</p>
            </div>
          )}
        </div>

        {/* MIDDLE — log */}
        <div className="col-span-12 md:col-span-6 flex flex-col gap-4">
          <div className={CARD} style={SHADOW}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-base">Expenses</h2>
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-[12px] text-sm font-medium hover:brightness-110 transition-all">
                <Plus className="w-4 h-4" /> Add Expense
              </button>
            </div>
            <ExpenseList expenses={expenses} symbol={symbol} />
          </div>
        </div>

        {/* RIGHT — budgets */}
        <div className="col-span-12 md:col-span-3">
          <div className={CARD} style={SHADOW}>
            <BudgetPanel budgets={budgets} expenses={expenses} symbol={symbol} month={vm} year={vy} />
          </div>
        </div>
      </div>
    </div>
  );
}
