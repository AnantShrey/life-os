"use client";
import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { CATEGORIES } from "@/lib/expense-utils";
import { addExpense, updateExpense } from "@/app/expenses/actions";

type Expense = {
  id?: string; amount: number; category: string; description: string;
  date: string; notes?: string | null; is_recurring?: boolean;
  recurring_frequency?: string | null; recurring_end_date?: string | null;
};

const INPUT = "w-full bg-muted border border-border rounded-[12px] px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all";

export function ExpenseForm({
  symbol, onClose, initial,
}: {
  symbol: string; onClose: () => void; initial?: Expense;
}) {
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Food & Dining");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [recurring, setRecurring] = useState(initial?.is_recurring ?? false);
  const [freq, setFreq] = useState(initial?.recurring_frequency ?? "monthly");
  const [endDate, setEndDate] = useState(initial?.recurring_end_date ?? "");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return;
    const payload = {
      amount: parseFloat(amount), category, description: desc, date,
      notes: notes || undefined, is_recurring: recurring,
      recurring_frequency: recurring ? freq : undefined,
      recurring_end_date: recurring && endDate ? endDate : undefined,
    };
    startTransition(async () => {
      if (initial?.id) await updateExpense(initial.id, payload);
      else await addExpense(payload);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
      <div className="bg-card w-full max-w-[480px] rounded-[24px] p-6 flex flex-col gap-4"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{initial ? "Edit Expense" : "Add Expense"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {/* Amount */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{symbol}</span>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00" required
              className={`${INPUT} pl-8`} />
          </div>

          {/* Category */}
          <select value={category} onChange={e => setCategory(e.target.value)} className={INPUT}>
            {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>

          {/* Description */}
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Description" required className={INPUT} />

          {/* Date */}
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={INPUT} />

          {/* Notes */}
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)" rows={2}
            className={`${INPUT} resize-none`} />

          {/* Recurring toggle */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setRecurring(r => !r)}
              className={`w-10 h-5 rounded-full relative transition-colors ${recurring ? "bg-primary" : "bg-muted-foreground/30"}`}>
              <div className={`absolute top-0.5 bottom-0.5 w-4 bg-white rounded-full transition-all ${recurring ? "left-[22px]" : "left-0.5"}`} />
            </button>
            <span className="text-sm font-medium">Recurring</span>
          </div>

          {recurring && (
            <div className="flex flex-col gap-2 pl-2 border-l-2 border-primary/20">
              <div className="inline-flex bg-muted rounded-[12px] p-1 gap-1">
                {["daily","weekly","monthly","yearly"].map(f => (
                  <button key={f} type="button" onClick={() => setFreq(f)}
                    className={`px-3 py-1 rounded-[8px] text-xs font-medium capitalize transition-all ${freq === f ? "bg-white dark:bg-slate-700 text-foreground shadow-sm" : "text-muted-foreground"}`}>
                    {f}
                  </button>
                ))}
              </div>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                placeholder="End date (optional)" className={INPUT} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-[12px] text-sm font-medium hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 py-2.5 bg-primary text-white rounded-[12px] text-sm font-medium hover:brightness-110 transition-all disabled:opacity-60">
              {pending ? "Saving…" : initial ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
