"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, X } from "lucide-react";
import { WatchlistCard } from "@/components/watchlist/WatchlistCard";
import { SearchModal } from "@/components/watchlist/SearchModal";
import { WatchlistFilters, MediaFilter, StatusFilter } from "./WatchlistFilters";
import { SortOption } from "./SortDropdown";
import { CollectionsGrid } from "./CollectionsGrid";
import { Collection } from "./CollectionCard";

type Item = {
  id: string; title: string; type: "movie"|"tv"; status: "want"|"watching"|"watched";
  poster_path?: string|null; release_year?: number|null; genres?: string[]|null;
  tmdb_rating?: number|null; rating?: number|null; current_season?: number|null;
  current_episode?: number|null; overview?: string|null; notes?: string|null;
  created_at: string;
  watchlist_collections?: { collection_id: string; position: number; collections: { id: string; name: string } | null }[];
};

export function WatchlistGrid({ 
  items, 
  collections 
}: { 
  items: Item[];
  collections: Collection[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showSearch, setShowSearch] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"all"|"collections">(
    (searchParams.get("tab") as "all"|"collections") || "all"
  );
  
  // Filters state
  const [typeFilter, setTypeFilter] = useState<MediaFilter>(
    (searchParams.get("type") as MediaFilter) || "all"
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get("status") as StatusFilter) || "all"
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") || ""
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "date_desc"
  );

  // Sync state to URL params when it changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== "all") params.set("tab", activeTab);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (searchQuery) params.set("q", searchQuery);
    if (sortBy !== "date_desc") params.set("sort", sortBy);
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [activeTab, typeFilter, statusFilter, searchQuery, sortBy, pathname, router]);

  // Apply filters
  let filtered = items;

  if (typeFilter !== "all") {
    filtered = filtered.filter(i => i.type === typeFilter);
  }
  
  if (statusFilter !== "all") {
    filtered = filtered.filter(i => i.status === statusFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(i => i.title.toLowerCase().includes(q));
  }

  // Apply sorting
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "date_desc": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "date_asc": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "title_asc": return a.title.localeCompare(b.title);
      case "title_desc": return b.title.localeCompare(a.title);
      case "year_desc": return (b.release_year || 0) - (a.release_year || 0);
      case "year_asc": return (a.release_year || 0) - (b.release_year || 0);
      case "tmdb_desc": return (b.tmdb_rating || 0) - (a.tmdb_rating || 0);
      case "tmdb_asc": return (a.tmdb_rating || 0) - (b.tmdb_rating || 0);
      case "rating_desc": return (b.rating || 0) - (a.rating || 0);
      case "rating_asc": return (a.rating || 0) - (b.rating || 0);
      default: return 0;
    }
  });

  const hasActiveFilters = typeFilter !== "all" || statusFilter !== "all" || !!searchQuery;
  const clearAllFilters = () => {
    setTypeFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  return (
    <>
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

      {/* Tab Switcher */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-[14px] p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-[10px] text-[13px] transition-all ${
              activeTab === "all" 
                ? "bg-white dark:bg-slate-700 font-medium shadow-[0_1px_4px_rgba(0,0,0,0.08)]" 
                : "bg-transparent text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            All Titles
          </button>
          <button
            onClick={() => setActiveTab("collections")}
            className={`px-4 py-1.5 rounded-[10px] text-[13px] transition-all ${
              activeTab === "collections" 
                ? "bg-white dark:bg-slate-700 font-medium shadow-[0_1px_4px_rgba(0,0,0,0.08)]" 
                : "bg-transparent text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            Collections
          </button>
        </div>
      </div>

      {activeTab === "collections" ? (
        <CollectionsGrid collections={collections} allWatchlistItems={items} />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-[14px] text-sm font-medium hover:brightness-110 transition-all shadow-md">
              <Plus className="w-4 h-4" /> Add to Watchlist
            </button>
          </div>

          <WatchlistFilters 
            typeFilter={typeFilter} setTypeFilter={setTypeFilter}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            sortBy={sortBy} setSortBy={setSortBy}
            resultCount={filtered.length} totalCount={items.length}
          />

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 mb-2">
              <span className="text-sm font-medium text-muted-foreground mr-1">Active filters:</span>
              
              {typeFilter !== "all" && (
                <div className="flex items-center gap-1 bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 rounded-[20px] px-2.5 py-0.5 text-xs">
                  {typeFilter === "movie" ? "Movies" : "TV Shows"}
                  <button onClick={() => setTypeFilter("all")} className="p-0.5 hover:text-red-500 rounded-full text-muted-foreground transition-colors"><X className="w-3 h-3" /></button>
                </div>
              )}
              
              {statusFilter !== "all" && (
                <div className="flex items-center gap-1 bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 rounded-[20px] px-2.5 py-0.5 text-xs">
                  {statusFilter === "want" ? "Want to Watch" : statusFilter === "watching" ? "Watching" : "Watched"}
                  <button onClick={() => setStatusFilter("all")} className="p-0.5 hover:text-red-500 rounded-full text-muted-foreground transition-colors"><X className="w-3 h-3" /></button>
                </div>
              )}
              
              {searchQuery && (
                <div className="flex items-center gap-1 bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 rounded-[20px] px-2.5 py-0.5 text-xs">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="p-0.5 hover:text-red-500 rounded-full text-muted-foreground transition-colors"><X className="w-3 h-3" /></button>
                </div>
              )}

              {((typeFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0) + (searchQuery ? 1 : 0)) > 1 && (
                <button onClick={clearAllFilters} className="text-xs text-primary hover:underline ml-2">
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Grid / Empty State */}
          <div className="mt-6">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-card rounded-[24px] border border-border/50">
                <span className="text-5xl mb-2">🎬</span>
                <h3 className="font-semibold text-lg">No titles found</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {typeFilter !== "all" && statusFilter === "all" && !searchQuery
                    ? `No ${typeFilter === "movie" ? "Movies" : "TV Shows"} in your watchlist yet.`
                    : statusFilter !== "all" && typeFilter === "all" && !searchQuery
                    ? `Nothing marked as ${statusFilter === "want" ? "Want to Watch" : statusFilter === "watching" ? "Watching" : "Watched"} yet.`
                    : searchQuery
                    ? `No results for "${searchQuery}".`
                    : "Your filters returned no results."}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="mt-2 text-primary text-sm font-medium hover:underline">
                    Clear filters
                  </button>
                )}
                {!hasActiveFilters && (
                  <button onClick={() => setShowSearch(true)} className="mt-2 text-primary text-sm font-medium hover:underline">
                    Add your first title →
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(item => (
                  <WatchlistCard 
                    key={item.id} 
                    item={item as any} 
                    allCollections={collections} 
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
