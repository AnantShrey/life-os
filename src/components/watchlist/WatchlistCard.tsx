"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Trash2, Pencil, ChevronDown } from "lucide-react";
import { updateWatchlistItem, deleteWatchlistItem } from "@/app/watchlist/actions";
import { CollectionBadge } from "./CollectionBadge";
import { AddToCollectionPopup, MinimalCollection } from "./AddToCollectionPopup";

type Item = {
  id: string; title: string; type: "movie"|"tv"; status: "want"|"watching"|"watched";
  poster_path?: string|null; release_year?: number|null; genres?: string[]|null;
  tmdb_rating?: number|null; rating?: number|null; current_season?: number|null;
  current_episode?: number|null; overview?: string|null; notes?: string|null;
  watchlist_collections?: { collection_id: string; position: number; collections: { id: string; name: string } | null }[];
};

const STATUS_STYLES: Record<string,string> = {
  want: "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300",
  watching: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  watched: "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-300",
};
const STATUS_LABELS = { want: "Want to Watch", watching: "Watching", watched: "Watched" };

export function WatchlistCard({ 
  item,
  allCollections 
}: { 
  item: Item;
  allCollections?: MinimalCollection[];
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(item.status);
  const [season, setSeason] = useState(item.current_season || 1);
  const [episode, setEpisode] = useState(item.current_episode || 1);
  const [editProgress, setEditProgress] = useState(false);

  const updateStatus = (s: "want"|"watching"|"watched") => {
    setStatus(s);
    startTransition(() => updateWatchlistItem(item.id, { status: s }));
  };

  const saveProgress = () => {
    startTransition(() => updateWatchlistItem(item.id, { current_season: season, current_episode: episode }));
    setEditProgress(false);
  };

  return (
    <div className="group bg-card rounded-[20px] p-4 flex gap-4 transition-all hover:-translate-y-0.5"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.06)" }}>
      {/* Poster */}
      <div className="relative w-20 h-[120px] rounded-[10px] overflow-hidden flex-shrink-0 bg-muted"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        {item.poster_path ? (
          <Image src={item.poster_path} alt={item.title} fill className="object-cover" sizes="80px" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
            {item.type === "tv" ? "📺" : "🎬"}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div>
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{item.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.release_year && <span className="text-xs text-muted-foreground">{item.release_year}</span>}
            <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {item.type === "tv" ? "TV" : "Film"}
            </span>
          </div>
          {item.genres && item.genres.length > 0 && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{item.genres.slice(0,2).join(", ")}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {item.tmdb_rating && <span className="text-xs text-amber-500 font-medium">⭐ {item.tmdb_rating}</span>}
          {item.rating && <span className="text-xs text-muted-foreground">You: {item.rating}/10</span>}
        </div>

        {/* TV progress */}
        {item.type === "tv" && status === "watching" && (
          editProgress ? (
            <div className="flex items-center gap-2">
              <input type="number" min={1} value={season} onChange={e=>setSeason(+e.target.value)}
                className="w-16 bg-muted border border-border rounded-[8px] px-2 py-1 text-xs" placeholder="S" />
              <input type="number" min={1} value={episode} onChange={e=>setEpisode(+e.target.value)}
                className="w-16 bg-muted border border-border rounded-[8px] px-2 py-1 text-xs" placeholder="E" />
              <button onClick={saveProgress} className="text-xs text-primary font-medium">Save</button>
            </div>
          ) : (
            <button onClick={()=>setEditProgress(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left">
              S{season} E{episode} <Pencil className="w-2.5 h-2.5 inline ml-1" />
            </button>
          )
        )}

        <div className="flex flex-col gap-2 mt-auto">
          {item.watchlist_collections && item.watchlist_collections.length > 0 && (
            <CollectionBadge collections={item.watchlist_collections as any} />
          )}
          <select value={status} onChange={e=>updateStatus(e.target.value as any)} disabled={pending}
            className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer appearance-none self-start ${STATUS_STYLES[status]}`}>
            {Object.entries(STATUS_LABELS).map(([v,l])=>(
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {allCollections && (
          <AddToCollectionPopup 
            watchlistId={item.id} 
            itemCollections={item.watchlist_collections?.map(c => c.collection_id) || []}
            allCollections={allCollections}
          />
        )}
        <button disabled={pending}
          onClick={() => { if (confirm("Remove from watchlist?")) startTransition(()=>deleteWatchlistItem(item.id)); }}
          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-[8px] transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
