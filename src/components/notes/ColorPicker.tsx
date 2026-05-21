"use client";
import { useEffect, useRef } from "react";

const COLORS = [
  { id: "default", bg: "bg-slate-200 dark:bg-slate-700" },
  { id: "red", bg: "bg-red-300 dark:bg-red-800" },
  { id: "orange", bg: "bg-orange-300 dark:bg-orange-800" },
  { id: "yellow", bg: "bg-yellow-300 dark:bg-yellow-800" },
  { id: "green", bg: "bg-green-300 dark:bg-green-800" },
  { id: "teal", bg: "bg-teal-300 dark:bg-teal-800" },
  { id: "blue", bg: "bg-blue-300 dark:bg-blue-800" },
  { id: "purple", bg: "bg-purple-300 dark:bg-purple-800" },
  { id: "pink", bg: "bg-pink-300 dark:bg-pink-800" },
];

export function ColorPicker({
  selected,
  onSelect,
  onClose,
}: {
  selected: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={ref}
      className="absolute bottom-full left-0 mb-2 p-2 bg-card border border-border rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex gap-1.5 z-50"
    >
      {COLORS.map(c => (
        <button
          key={c.id}
          onClick={() => {
            onSelect(c.id);
            onClose();
          }}
          className={`w-6 h-6 rounded-full ${c.bg} transition-transform hover:scale-110 ${
            selected === c.id ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
          }`}
          title={c.id}
        />
      ))}
    </div>
  );
}
