"use client";
import { useState, useTransition } from "react";
import { Pencil, Check, Plus } from "lucide-react";
import { CATEGORIES, formatCurrency, getCategoryConfig } from "@/lib/expense-utils";
import { upsertBudget } from "@/app/expenses/actions";
import { toast } from "sonner";

type Budget = { id: string; category: string; amount: number; month: number; year: number };
type Expense = { category: string; amount: number };

export function BudgetPanel({
  budgets, expenses, symbol, month, year,
}: {
  budgets: Budget[]; expenses: Expense[]; symbol: string; month: number; year: number;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState(CATEGORIES[0].name);
  const [newAmt, setNewAmt] = useState("");
  const [pending, startTransition] = useTransition();

  const spentByCategory: Record<string, number> = {};
  for (const e of expenses) {
    spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
  }

  const save = (category: string, amount: number) => {
    startTransition(async () => {
      const res = await upsertBudget(category, amount, month, year);
      if (res && !res.success) {
        toast.error(res.error || "Failed to save budget");
      } else {
        toast.success("Budget saved");
        setEditing(null);
      }
    });
  };

  const INPUT = "bg-muted border border-border rounded-[10px] px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 w-28";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        Monthly Budgets
      </p>

      {budgets.map(b => {
        const spent = spentByCategory[b.category] || 0;
        const pct = Math.min((spent / b.amount) * 100, 100);
        const over = spent > b.amount;
        const warn = pct >= 75 && !over;
        const barColor = over ? "bg-red-500" : warn ? "bg-amber-500" : "bg-green-500";
        const cfg = getCategoryConfig(b.category);
        const Icon = cfg.icon;

        return (
          <div key={b.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                <span className="truncate max-w-[100px]">{b.category}</span>
              </span>
              {editing === b.category ? (
                <div className="flex items-center gap-1">
                  <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                    className={INPUT} autoFocus />
                  <button onClick={() => save(b.category, parseFloat(editVal))}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-[8px] transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className={`text-xs ${over ? "text-red-500" : "text-muted-foreground"}`}>
                    {formatCurrency(spent, symbol)} / {formatCurrency(b.amount, symbol)}
                  </span>
                  <button onClick={() => { setEditing(b.category); setEditVal(String(b.amount)); }}
                    className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}

      {/* Add budget */}
      {showAdd ? (
        <div className="flex flex-col gap-2 border border-border rounded-[12px] p-3">
          <select value={newCat} onChange={e => setNewCat(e.target.value)}
            className="bg-muted border border-border rounded-[10px] px-3 py-1.5 text-sm focus:outline-none w-full">
            {CATEGORIES.filter(c => !budgets.find(b => b.category === c.name)).map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input type="number" value={newAmt} onChange={e => setNewAmt(e.target.value)}
              placeholder="Amount" className={`${INPUT} flex-1 w-full`} />
            <button onClick={() => { save(newCat, parseFloat(newAmt)); setShowAdd(false); setNewAmt(""); }}
              className="px-3 py-1.5 bg-primary text-white text-xs rounded-[10px] font-medium hover:brightness-110 transition-all">
              Set
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 text-sm text-primary hover:bg-primary/5 px-3 py-2 rounded-[10px] transition-colors">
          <Plus className="w-4 h-4" />
          Set budget for a category
        </button>
      )}
    </div>
  );
}
