"use client";
import { useState } from "react";
import { CURRENCIES } from "@/lib/expense-utils";
import { savePreferences } from "@/app/settings/actions";

export function CurrencySelector({ current }: { current: string }) {
  const [value, setValue] = useState(current);
  const [saved, setSaved] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const cfg = CURRENCIES.find(c => c.code === code)!;
    setValue(code);
    await savePreferences(code, cfg.symbol);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          className="appearance-none bg-muted border border-border rounded-[12px] px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all cursor-pointer"
        >
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {saved && (
        <span className="text-sm text-green-500 font-medium animate-in fade-in">Saved ✓</span>
      )}
    </div>
  );
}
