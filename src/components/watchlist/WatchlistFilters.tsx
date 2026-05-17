"use client";
import { Search, X } from "lucide-react";
import { SortDropdown, SortOption } from "./SortDropdown";

export type MediaFilter = "all" | "movie" | "tv";
export type StatusFilter = "all" | "want" | "watching" | "watched";

interface FiltersProps {
  typeFilter: MediaFilter;
  setTypeFilter: (v: MediaFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  sortBy: SortOption;
  setSortBy: (v: SortOption) => void;
  resultCount: number;
  totalCount: number;
}

const TYPE_LABELS: Record<MediaFilter, string> = { all: "🎬 All", movie: "🎬 Movies", tv: "📺 TV Shows" };
const STATUS_LABELS: Record<StatusFilter, string> = { all: "All", want: "Want to Watch", watching: "Watching", watched: "Watched" };

export function WatchlistFilters({
  typeFilter, setTypeFilter,
  statusFilter, setStatusFilter,
  searchQuery, setSearchQuery,
  sortBy, setSortBy,
  resultCount, totalCount
}: FiltersProps) {

  const STATUS_COLORS = {
    all: "text-primary",
    want: "text-purple-500",
    watching: "text-blue-500",
    watched: "text-green-500"
  };

  const TYPE_PILL = (v: MediaFilter) => {
    const active = typeFilter === v;
    return (
      <button
        key={v} onClick={() => setTypeFilter(v)}
        className={`px-3 py-1.5 rounded-[10px] text-[13px] transition-all ${
          active 
            ? "bg-white dark:bg-slate-700 text-primary font-medium shadow-[0_1px_4px_rgba(0,0,0,0.08)]" 
            : "bg-transparent text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
        }`}
      >
        {TYPE_LABELS[v]}
      </button>
    );
  };

  const STATUS_PILL = (v: StatusFilter) => {
    const active = statusFilter === v;
    return (
      <button
        key={v} onClick={() => setStatusFilter(v)}
        className={`px-3 py-1.5 rounded-[10px] text-[13px] transition-all ${
          active 
            ? `bg-white dark:bg-slate-700 font-medium shadow-[0_1px_4px_rgba(0,0,0,0.08)] ${STATUS_COLORS[v]}` 
            : "bg-transparent text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
        }`}
      >
        {STATUS_LABELS[v]}
      </button>
    );
  };

  return (
    <div className="sticky top-0 z-10 bg-background/80 dark:bg-slate-950/80 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex flex-col gap-3">
        {/* Row 1: Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-[14px] p-1">
            {(["all", "movie", "tv"] as MediaFilter[]).map(TYPE_PILL)}
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-[14px] p-1">
            {(["all", "want", "watching", "watched"] as StatusFilter[]).map(STATUS_PILL)}
          </div>

          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search your watchlist..."
              className="w-[220px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px] py-2 pl-9 pr-3 text-[13px] focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all"
            />
          </div>
        </div>

        {/* Row 2: Sort & Count */}
        <div className="flex items-center justify-between">
          <SortDropdown value={sortBy} onChange={setSortBy} />
          
          <div className="text-[13px] text-muted-foreground">
            {typeFilter === "all" && statusFilter === "all" && !searchQuery
              ? `${totalCount} titles`
              : `Showing ${resultCount} of ${totalCount} titles`
            }
          </div>
        </div>
      </div>
    </div>
  );
}
