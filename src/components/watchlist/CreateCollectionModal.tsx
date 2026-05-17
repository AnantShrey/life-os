"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { X, Search, Check } from "lucide-react";
import { createCollection, updateCollection } from "@/app/watchlist/actions";

const INPUT = "w-full bg-muted border border-border rounded-[12px] px-4 py-2.5 text-[13px] focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all";

type WatchlistItem = {
  id: string;
  title: string;
  poster_path?: string | null;
  type: "movie" | "tv";
};

export function CreateCollectionModal({
  onClose,
  allWatchlistItems,
  initialData,
  preselectedWatchlistId
}: {
  onClose: () => void;
  allWatchlistItems: WatchlistItem[];
  initialData?: { id: string; name: string; description?: string | null; cover_watchlist_id?: string | null };
  preselectedWatchlistId?: string;
}) {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [coverId, setCoverId] = useState<string | null>(initialData?.cover_watchlist_id || null);
  
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(preselectedWatchlistId ? [preselectedWatchlistId] : [])
  );
  
  const [pending, startTransition] = useTransition();

  const filteredItems = allWatchlistItems.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleItem = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      if (isEditing) {
        await updateCollection(initialData.id, {
          name,
          description: description || null,
          cover_watchlist_id: coverId,
        });
        alert("Collection updated ✓");
      } else {
        await createCollection({
          name,
          description: description || null,
          cover_watchlist_id: coverId,
        }, Array.from(selectedItems));
        alert("Collection created ✓");
      }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
      <div className="bg-card w-full max-w-[500px] max-h-[90vh] rounded-[24px] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
        
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">{isEditing ? "Edit Collection" : "New Collection"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex flex-col gap-6">
          
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Name *</label>
            <input 
              autoFocus
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Marvel Cinematic Universe" 
              className={INPUT} 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="A brief description of this collection" 
              rows={3}
              className={`${INPUT} resize-none`} 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Cover Image</label>
            <p className="text-xs text-muted-foreground mb-3">Pick any title's poster as the cover</p>
            
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 snap-x">
              <button 
                onClick={() => setCoverId(null)}
                className={`flex-shrink-0 w-12 h-[72px] rounded-[8px] flex items-center justify-center transition-all snap-start ${
                  coverId === null ? "ring-2 ring-sky-500 ring-offset-2 ring-offset-card bg-sky-100 dark:bg-sky-900" : "bg-muted hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span className="text-[10px] text-muted-foreground font-medium">None</span>
              </button>
              
              {allWatchlistItems.map(item => {
                const isSelected = coverId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCoverId(item.id)}
                    className={`relative flex-shrink-0 w-12 h-[72px] rounded-[8px] overflow-hidden transition-all snap-start ${
                      isSelected ? "ring-2 ring-sky-500 ring-offset-2 ring-offset-card" : "hover:opacity-80"
                    }`}
                  >
                    {item.poster_path ? (
                      <Image src={item.poster_path} alt={item.title} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-xs">🎬</div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {!isEditing && (
            <div className="flex flex-col min-h-[250px]">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Add Items</label>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search your watchlist..."
                  className="w-full bg-muted border border-border rounded-[10px] py-2 pl-9 pr-3 text-[13px] focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="flex-1 overflow-y-auto border border-border rounded-[12px] bg-slate-50 dark:bg-slate-900/50 p-2 space-y-1">
                {filteredItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No matching items found</p>
                ) : (
                  filteredItems.map(item => {
                    const isSelected = selectedItems.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-[8px] transition-all text-left ${
                          isSelected ? "bg-white dark:bg-slate-800 shadow-sm" : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="w-8 h-12 rounded-[6px] overflow-hidden relative flex-shrink-0 bg-muted">
                          {item.poster_path && <Image src={item.poster_path} alt={item.title} fill className="object-cover" sizes="32px" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium truncate">{item.title}</p>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                            {item.type === "tv" ? "TV" : "Film"}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected ? "bg-sky-500 border-sky-500 text-white" : "border-slate-300 dark:border-slate-600"
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

        <div className="p-5 border-t border-border flex justify-end gap-3 bg-muted/30">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-[12px] text-[13px] font-medium border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={pending || !name.trim()}
            onClick={handleSave}
            className="px-5 py-2 rounded-[12px] text-[13px] font-medium text-white shadow-sm hover:brightness-110 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}
          >
            {pending ? "Saving..." : isEditing ? "Save Changes" : "Create Collection"}
          </button>
        </div>

      </div>
    </div>
  );
}
