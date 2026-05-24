"use client";
import { useState, useEffect, useRef, useTransition } from "react";
import { X, Search, Star, Plus } from "lucide-react";
import Image from "next/image";
import { searchTMDB, getTMDBDetails, mapTMDBResult, TMDB_THUMB_BASE, TMDB_IMAGE_BASE } from "@/lib/tmdb";
import { addToWatchlist } from "@/app/watchlist/actions";
import { useRouter } from "next/navigation";

type Status = "want" | "watching" | "watched";

const INPUT = "w-full bg-muted border border-border rounded-[12px] px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all";

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [status, setStatus] = useState<Status>("want");
  const [rating, setRating] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim() || query.length < 2) { 
      setResults([]); 
      setIsLoading(false);
      setError(false);
      return; 
    }
    setIsLoading(true);
    setError(false);
    timer.current = setTimeout(async () => {
      // Cancel any previous in-flight request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const res = await searchTMDB(query, abortRef.current.signal); // pass signal
        setResults(res.slice(0, 12));
      } catch (err: any) {
        if (err.name === "AbortError") return; // ignore cancelled requests
        setError(true);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query]);

  const handleSelect = async (item: any) => {
    const details = await getTMDBDetails(item.id, item.media_type);
    setSelected({ ...item, ...(details || {}) });
  };

  const handleAdd = () => {
    if (!selected) return;
    const mapped = mapTMDBResult(selected);
    startTransition(async () => {
      const res = await addToWatchlist({
        tmdb_id: selected.id.toString(),
        type: mapped.media_type,
        title: mapped.title,
        poster_path: mapped.poster_path,
        backdrop_path: mapped.backdrop_path,
        overview: mapped.overview,
        release_year: mapped.release_year,
        genres: mapped.genres,
        tmdb_rating: mapped.tmdb_rating,
        status,
        rating: rating || null,
        notes: notes || null,
        current_season: mapped.media_type === "tv" ? season : null,
        current_episode: mapped.media_type === "tv" ? episode : null,
      });

      if (res && !res.success) {
        alert(res.error === "Already in your watchlist" ? res.error : "Error: " + res.error);
        return;
      }
      
      alert("Added to watchlist ✓");
      router.refresh();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
      <div className="bg-card w-full max-w-[640px] max-h-[90vh] rounded-[24px] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search movies & TV shows…" className="flex-1 bg-transparent text-base outline-none" />
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {!selected ? (
            // Results grid
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {results.map(item => (
                <button key={item.id} onClick={() => handleSelect(item)}
                  className="group flex flex-col rounded-[12px] overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-md text-left">
                  <div className="relative w-full aspect-[2/3] bg-muted">
                    {item.poster_path ? (
                      <Image src={`${TMDB_THUMB_BASE}${item.poster_path}`} alt={item.title||item.name}
                        fill className="object-cover" sizes="160px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">🎬</div>
                    )}
                    <span className="absolute top-1.5 right-1.5 text-[10px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                      {item.media_type === "tv" ? "TV" : "Film"}
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium line-clamp-2 leading-tight">{item.title || item.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {(item.release_date || item.first_air_date || "").substring(0,4)}
                      {item.vote_average ? ` · ⭐ ${item.vote_average.toFixed(1)}` : ""}
                    </p>
                  </div>
                </button>
              ))}
              {results.length === 0 && query.length >= 2 && !isLoading && !error && (
                <div className="col-span-full text-center py-12 text-muted-foreground text-sm">No results found</div>
              )}
              {(!query || query.length < 2) && !isLoading && !error && (
                <div className="col-span-full text-center py-12 text-muted-foreground text-sm">Type at least 2 characters to search…</div>
              )}
              {isLoading && (
                <div className="col-span-full text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </div>
              )}
              {error && !isLoading && (
                <div className="col-span-full text-center py-12 text-red-500 text-sm">Search error — please try again</div>
              )}

            </div>
          ) : (
            // Detail panel
            <div className="p-5 flex flex-col gap-4">
              <button onClick={() => setSelected(null)} className="text-sm text-primary hover:underline self-start">← Back to results</button>
              <div className="flex gap-4">
                <div className="relative w-20 h-28 rounded-[10px] overflow-hidden flex-shrink-0 bg-muted shadow-md">
                  {selected.poster_path ? (
                    <Image src={`${TMDB_THUMB_BASE}${selected.poster_path}`} alt={selected.title||selected.name}
                      fill className="object-cover" sizes="80px" />
                  ) : <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg leading-tight">{selected.title || selected.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {(selected.release_date || selected.first_air_date || "").substring(0,4)}
                    {selected.vote_average ? ` · ⭐ ${selected.vote_average.toFixed(1)}` : ""}
                    {selected.runtime ? ` · ${selected.runtime}min` : ""}
                    {selected.number_of_seasons ? ` · ${selected.number_of_seasons} seasons` : ""}
                  </p>
                  {selected.genres && <p className="text-xs text-muted-foreground mt-1">{selected.genres.slice(0,3).map((g:any)=>g.name||g).join(", ")}</p>}
                  {selected.overview && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{selected.overview}</p>}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Status</p>
                <div className="inline-flex bg-muted rounded-[12px] p-1 gap-1">
                  {([["want","Want"],["watching","Watching"],["watched","Watched"]] as const).map(([v,l]) => (
                    <button key={v} type="button" onClick={() => setStatus(v)}
                      className={`px-4 py-1.5 rounded-[8px] text-sm font-medium transition-all ${
                        status === v ? "bg-white dark:bg-slate-700 text-foreground shadow-sm" : "text-muted-foreground"
                      }`}>{l}</button>
                  ))}
                </div>
              </div>

              {/* TV progress */}
              {(selected.media_type === "tv" || selected.first_air_date) && status === "watching" && (
                <div className="flex gap-3">
                  <div className="flex-1"><label className="text-xs text-muted-foreground">Season</label>
                    <input type="number" min={1} value={season} onChange={e=>setSeason(+e.target.value)} className={INPUT} /></div>
                  <div className="flex-1"><label className="text-xs text-muted-foreground">Episode</label>
                    <input type="number" min={1} value={episode} onChange={e=>setEpisode(+e.target.value)} className={INPUT} /></div>
                </div>
              )}

              {/* Rating */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Your Rating</p>
                <div className="flex gap-1">
                  {Array.from({length:10},(_,i)=>i+1).map(n=>(
                    <button key={n} type="button" onClick={()=>setRating(n)}
                      className={`text-lg transition-all ${n<=rating?"text-amber-400":"text-muted-foreground/30"} hover:text-amber-400`}>★</button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                placeholder="Personal notes (optional)" rows={2} className={`${INPUT} resize-none`} />

              <button onClick={handleAdd} disabled={pending}
                className="flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-[12px] font-medium hover:brightness-110 transition-all disabled:opacity-60">
                <Plus className="w-4 h-4" />
                {pending ? "Adding…" : "Add to Watchlist"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
