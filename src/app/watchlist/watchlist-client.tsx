"use client";
import { useState } from "react";
import { Plus, Film, Tv, CheckCircle, Clock } from "lucide-react";
import { WatchlistCard } from "@/components/watchlist/WatchlistCard";
import { SearchModal } from "@/components/watchlist/SearchModal";

type Item = {
  id: string; title: string; media_type: "movie"|"tv"; status: "want"|"watching"|"watched";
  poster_path?: string|null; release_year?: number|null; genres?: string[]|null;
  tmdb_rating?: number|null; user_rating?: number|null; current_season?: number|null;
  current_episode?: number|null; overview?: string|null; personal_notes?: string|null;
};

type MediaFilter = "all"|"movie"|"tv";
type StatusFilter = "all"|"want"|"watching"|"watched";

export function WatchlistClient({ items }: { items: Item[] }) {
  const [showSearch, setShowSearch] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = items.filter(i =>
    (mediaFilter === "all" || i.media_type === mediaFilter) &&
    (statusFilter === "all" || i.status === statusFilter) &&
    (!search || i.title.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    movies: items.filter(i => i.media_type === "movie").length,
    tv: items.filter(i => i.media_type === "tv").length,
    watched: items.filter(i => i.status === "watched").length,
    want: items.filter(i => i.status === "want").length,
  };

  const PILL = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition-all ${active ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`;

  return (
    <>
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

      {/* Stats bar */}
      <div className="flex gap-3 flex-wrap mb-5">
        {[
          { icon: "🎬", label: "Movies", val: stats.movies },
          { icon: "📺", label: "TV Shows", val: stats.tv },
          { icon: "✅", label: "Watched", val: stats.watched },
          { icon: "⏳", label: "To Watch", val: stats.want },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-[14px] px-4 py-2.5 flex items-center gap-2"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.06)" }}>
            <span>{s.icon}</span>
            <span className="font-bold">{s.val}</span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </div>
        ))}
        <button onClick={() => setShowSearch(true)}
          className="ml-auto flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-[14px] text-sm font-medium hover:brightness-110 transition-all shadow-md">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <div className="flex gap-1 bg-muted p-1 rounded-full">
          {(["all","movie","tv"] as MediaFilter[]).map(f => (
            <button key={f} onClick={() => setMediaFilter(f)} className={PILL(mediaFilter === f)}>
              {f === "all" ? "All" : f === "movie" ? "Movies" : "TV Shows"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-muted p-1 rounded-full">
          {([["all","All"],["want","Want"],["watching","Watching"],["watched","Watched"]] as [StatusFilter,string][]).map(([v,l]) => (
            <button key={v} onClick={() => setStatusFilter(v)} className={PILL(statusFilter === v)}>{l}</button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search saved titles…"
          className="ml-auto bg-muted border border-border rounded-[12px] px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all" />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <span className="text-5xl">🎬</span>
          <p className="font-medium text-muted-foreground text-lg">Nothing here yet</p>
          <button onClick={() => setShowSearch(true)}
            className="text-primary hover:underline text-sm">Add your first title →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => <WatchlistCard key={item.id} item={item} />)}
        </div>
      )}
    </>
  );
}
