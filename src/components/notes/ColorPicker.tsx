"use client";
import { useEffect, useRef } from "react";

const GOAL_COLORS = [
  { value: 'default', bg: 'bg-slate-100', ring: 'ring-slate-400', label: 'Default' },
  { value: 'red',     bg: 'bg-red-400',    ring: 'ring-red-400',    label: 'Red' },
  { value: 'orange',  bg: 'bg-orange-400', ring: 'ring-orange-400', label: 'Orange' },
  { value: 'yellow',  bg: 'bg-yellow-400', ring: 'ring-yellow-400', label: 'Yellow' },
  { value: 'green',   bg: 'bg-green-400',  ring: 'ring-green-400',  label: 'Green' },
  { value: 'teal',    bg: 'bg-teal-400',   ring: 'ring-teal-400',   label: 'Teal' },
  { value: 'blue',    bg: 'bg-blue-400',   ring: 'ring-blue-400',   label: 'Blue' },
  { value: 'purple',  bg: 'bg-purple-400', ring: 'ring-purple-400', label: 'Purple' },
  { value: 'pink',    bg: 'bg-pink-400',   ring: 'ring-pink-400',   label: 'Pink' },
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
      className="absolute bottom-full left-0 mb-2 p-3 bg-card border border-border rounded-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex flex-wrap gap-3 z-50 w-max max-w-[280px]"
    >
      {GOAL_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => {
            onSelect(color.value);
            onClose();
          }}
          className={`
            w-8 h-8 rounded-full ${color.bg}
            transition-all duration-150 ring-offset-card
            ${selected === color.value
              ? `ring-2 ring-offset-2 ${color.ring} scale-110`
              : 'hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-slate-300 dark:hover:ring-slate-600'
            }
          `}
          title={color.label}
        />
      ))}
    </div>
  );
}
