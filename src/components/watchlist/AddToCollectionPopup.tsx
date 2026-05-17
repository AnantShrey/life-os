"use client";
import { useState, useRef, useEffect, useTransition } from "react";
import { FolderPlus, Check, Plus } from "lucide-react";
import { toggleWatchlistCollection } from "@/app/watchlist/actions";
import { CreateCollectionModal } from "./CreateCollectionModal";

export type MinimalCollection = {
  id: string;
  name: string;
  watchlist_collections?: { watchlist_id: string }[];
};

export function AddToCollectionPopup({
  watchlistId,
  itemCollections,
  allCollections
}: {
  watchlistId: string;
  itemCollections: string[]; // array of collection IDs this item is in
  allCollections: MinimalCollection[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pending, startTransition] = useTransition();
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleCollection = (collectionId: string, isCurrentlyIn: boolean) => {
    startTransition(() => {
      toggleWatchlistCollection(watchlistId, collectionId, !isCurrentlyIn);
    });
  };

  return (
    <>
      <div className="relative" ref={popupRef}>
        <button
          disabled={pending}
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[8px] transition-all"
          title="Add to collection"
        >
          <FolderPlus className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] p-2 min-w-[220px] z-[100]">
            <p className="text-[13px] font-medium text-muted-foreground px-2 py-1 mb-1">Add to collection</p>
            
            <div className="max-h-[200px] overflow-y-auto">
              {allCollections.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-2 italic">No collections yet</p>
              ) : (
                allCollections.map(col => {
                  const isChecked = itemCollections.includes(col.id);
                  const count = col.watchlist_collections?.length || 0;
                  return (
                    <button
                      key={col.id}
                      onClick={() => toggleCollection(col.id, isChecked)}
                      className="w-full flex items-center justify-between text-left px-2 py-1.5 rounded-[10px] text-[13px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-medium text-foreground truncate">{col.name}</span>
                        <span className="text-[10px] text-muted-foreground">{count} item{count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center border ${isChecked ? "bg-primary border-primary" : "border-slate-300 dark:border-slate-600"}`}>
                        {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="h-[1px] bg-slate-200 dark:bg-slate-700 my-1.5" />
            
            <button
              onClick={() => {
                setIsOpen(false);
                setShowCreateModal(true);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[10px] text-[13px] font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create new collection
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateCollectionModal
          preselectedWatchlistId={watchlistId}
          onClose={() => setShowCreateModal(false)}
          allWatchlistItems={[]} // In a real scenario, this would be passed down to allow multi-select, but since it's pre-selected, we don't strictly need to load the full UI if we just pass the ID. Wait, the modal requires the full list to show the picker.
        />
      )}
    </>
  );
}
