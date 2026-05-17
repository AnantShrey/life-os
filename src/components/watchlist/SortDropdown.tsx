"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type SortOption = 
  | "date_desc" | "date_asc" 
  | "title_asc" | "title_desc" 
  | "year_desc" | "year_asc" 
  | "tmdb_desc" | "tmdb_asc" 
  | "rating_desc" | "rating_asc";

const SORT_LABELS: Record<SortOption, string> = {
  date_desc: "Date Added (newest first)",
  date_asc: "Date Added (oldest first)",
  title_asc: "Title A → Z",
  title_desc: "Title Z → A",
  year_desc: "Release Year (newest first)",
  year_asc: "Release Year (oldest first)",
  tmdb_desc: "TMDB Rating (highest first)",
  tmdb_asc: "TMDB Rating (lowest first)",
  rating_desc: "Your Rating (highest first)",
  rating_asc: "Your Rating (lowest first)",
};

export function SortDropdown({ 
  value, 
  onChange 
}: { 
  value: SortOption; 
  onChange: (v: SortOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groups = [
    ["date_desc", "date_asc"],
    ["title_asc", "title_desc"],
    ["year_desc", "year_asc"],
    ["tmdb_desc", "tmdb_asc"],
    ["rating_desc", "rating_asc"],
  ] as SortOption[][];

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 rounded-[12px] px-3.5 py-2 bg-white dark:bg-slate-900 text-[13px] font-medium hover:border-primary transition-colors text-foreground"
      >
        <span className="text-muted-foreground mr-1">Sort by:</span>
        {SORT_LABELS[value]}
        <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 min-w-[220px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-1.5 z-50">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {groupIdx > 0 && <div className="h-[1px] bg-slate-200 dark:bg-slate-700 my-1 mx-2" />}
              {group.map(opt => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-[10px] text-[13px] transition-colors ${
                    value === opt 
                      ? "bg-sky-50 dark:bg-slate-800 text-primary font-medium" 
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {SORT_LABELS[opt]}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
