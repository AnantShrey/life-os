"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { CollectionCard, Collection } from "./CollectionCard";
import { CreateCollectionModal } from "./CreateCollectionModal";

export function CollectionsGrid({ 
  collections,
  allWatchlistItems 
}: { 
  collections: Collection[];
  allWatchlistItems: any[];
}) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <div className="flex justify-end mb-5 mt-2">
        <button 
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-[12px] text-[13px] font-medium hover:brightness-110 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-card rounded-[24px] border border-border/50">
          <span className="text-5xl mb-2">📚</span>
          <h3 className="font-semibold text-lg">No collections yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Group your movies and TV shows into franchises, trilogies, or custom universes.
          </p>
          <button 
            onClick={() => setShowCreate(true)} 
            className="mt-2 text-primary text-sm font-medium hover:underline"
          >
            Create your first collection →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {collections.map(col => (
            <CollectionCard 
              key={col.id} 
              collection={col} 
              allWatchlistItems={allWatchlistItems} 
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateCollectionModal
          allWatchlistItems={allWatchlistItems}
          onClose={() => setShowCreate(false)}
        />
      )}
    </>
  );
}
