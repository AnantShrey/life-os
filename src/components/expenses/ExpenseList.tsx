"use client";
import { useState, useTransition } from "react";
import { Trash2, Pencil, RefreshCw } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { getCategoryConfig, formatCurrency } from "@/lib/expense-utils";
import { deleteExpense } from "@/app/expenses/actions";
import { ExpenseForm } from "./ExpenseForm";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Expense = {
  id: string; amount: number; category: string; description: string;
  date: string; notes?: string | null; is_recurring?: boolean;
  recurring_frequency?: string | null;
};

function dateLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

export function ExpenseList({ expenses, symbol }: { expenses: Expense[]; symbol: string }) {
  const [editing, setEditing] = useState<Expense | null>(null);
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const executeDelete = () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await deleteExpense(deletingId);
      if (res && !res.success) toast.error(res.error || "Failed to delete expense");
      else toast.success("Expense deleted");
    });
  };

  const grouped: Record<string, Expense[]> = {};
  for (const e of expenses) {
    grouped[e.date] = grouped[e.date] ? [...grouped[e.date], e] : [e];
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (!expenses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="text-4xl">💸</span>
        <p className="font-medium text-muted-foreground">No expenses this month</p>
        <p className="text-sm text-muted-foreground">Click "+ Add Expense" to log one</p>
      </div>
    );
  }

  return (
    <>
      {editing && <ExpenseForm symbol={symbol} onClose={() => setEditing(null)} initial={editing} />}
      <div className="flex flex-col gap-4">
        {sortedDates.map(date => (
          <div key={date}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {dateLabel(date)}
            </p>
            <div className="flex flex-col gap-1">
              {grouped[date].map(exp => {
                const cfg = getCategoryConfig(exp.category);
                const Icon = cfg.icon;
                return (
                  <div key={exp.id}
                    className="group flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 ${cfg.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{exp.description}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{exp.category}</p>
                        {exp.is_recurring && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                            <RefreshCw className="w-2.5 h-2.5" />
                            {exp.recurring_frequency}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="font-semibold text-sm flex-shrink-0">{formatCurrency(exp.amount, symbol)}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(exp)}
                        className="p-1.5 rounded-[8px] hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button disabled={pending}
                        onClick={() => setDeletingId(exp.id)}
                        className="p-1.5 rounded-[8px] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-muted-foreground hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={executeDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
      />
    </>
  );
}
