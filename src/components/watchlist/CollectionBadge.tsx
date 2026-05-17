"use client";
import { Library } from "lucide-react";

type WatchlistCollectionData = {
  collection_id: string;
  collections: { id: string; name: string } | null;
};

export function CollectionBadge({ 
  collections 
}: { 
  collections?: WatchlistCollectionData[] 
}) {
  if (!collections || collections.length === 0) return null;

  // Filter out any invalid ones just in case
  const validCollections = collections.filter(c => c.collections).map(c => c.collections!);
  if (validCollections.length === 0) return null;

  const firstCollection = validCollections[0];
  const moreCount = validCollections.length - 1;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-[20px] px-2 py-0.5 text-[11px] font-medium border border-slate-200/50 dark:border-slate-600/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <Library className="w-[10px] h-[10px]" />
        {firstCollection.name}
      </div>
      {moreCount > 0 && (
        <div className="inline-flex items-center bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-[20px] px-2 py-0.5 text-[11px] font-medium border border-slate-200/50 dark:border-slate-600/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          +{moreCount} more
        </div>
      )}
    </div>
  );
}
