"use client";

import { useState, useTransition } from "react";
import { addHabitWithFrequency } from "./actions";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function HabitCreateForm() {
  const [freq, setFreq] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([1]); // Mon default
  const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([1]);
  const [endDate, setEndDate] = useState("");
  const [isPending, startTransition] = useTransition();

  const toggleDay = (d: number) => {
    setSelectedDays((prev) =>
      prev.includes(d) ? (prev.length > 1 ? prev.filter((x) => x !== d) : prev) : [...prev, d]
    );
  };

  const toggleMonthDay = (d: number) => {
    setSelectedMonthDays((prev) =>
      prev.includes(d) ? (prev.length > 1 ? prev.filter((x) => x !== d) : prev) : [...prev, d]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("frequency_type", freq);
    if (freq === "weekly") data.set("frequency_days", JSON.stringify(selectedDays));
    if (freq === "monthly") data.set("frequency_days", JSON.stringify(selectedMonthDays));
    if (endDate) data.set("end_date", endDate);

    startTransition(async () => {
      await addHabitWithFrequency(data);
      form.reset();
      setFreq("daily");
      setSelectedDays([1]);
      setSelectedMonthDays([1]);
      setEndDate("");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)] p-6 mb-8 flex flex-col gap-5"
    >
      <h3 className="font-semibold text-lg">Create a new habit</h3>

      {/* Name + Description row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name="name"
          placeholder="Habit name (e.g. Read 10 pages)"
          className="flex-1 bg-muted border border-border rounded-[12px] px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all"
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Optional description"
          className="flex-1 bg-muted border border-border rounded-[12px] px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all"
        />
      </div>

      {/* Frequency type segmented control */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Frequency
        </label>
        <div className="inline-flex bg-muted rounded-[14px] p-1 gap-1">
          {(["daily", "weekly", "monthly"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFreq(f)}
              className={`px-4 py-1.5 rounded-[10px] text-sm font-medium transition-all ${
                freq === f
                  ? "bg-white dark:bg-slate-700 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly day picker */}
      {freq === "weekly" && (
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            On these days
          </label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                title={DAYS_FULL[i]}
                className={`w-9 h-9 rounded-full text-xs font-semibold border-2 transition-all ${
                  selectedDays.includes(i)
                    ? "bg-primary border-primary text-white"
                    : "border-border text-muted-foreground hover:border-primary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monthly day picker */}
      {freq === "monthly" && (
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            On these days of the month
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleMonthDay(d)}
                className={`w-8 h-8 rounded-full text-xs font-semibold border-2 transition-all ${
                  selectedMonthDays.includes(d)
                    ? "bg-primary border-primary text-white"
                    : "border-border text-muted-foreground hover:border-primary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* End date */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          End date (optional)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-muted border border-border rounded-[12px] px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all"
          />
          {endDate && (
            <button
              type="button"
              onClick={() => setEndDate("")}
              className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-[10px] px-2.5 py-1.5 transition-colors"
            >
              ✕ Clear
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">Leave empty to repeat indefinitely</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="self-start bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] text-white px-6 py-2.5 rounded-[12px] font-medium text-sm hover:brightness-110 hover:-translate-y-[1px] transition-all shadow-md disabled:opacity-60"
      >
        {isPending ? "Adding…" : "Add Habit"}
      </button>
    </form>
  );
}
