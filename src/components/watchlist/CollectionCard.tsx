"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Library, Pencil, Trash2 } from "lucide-react";
import { deleteCollection } from "@/app/watchlist/actions";
import { CreateCollectionModal } from "./CreateCollectionModal";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export type Collection = {
  id: string;
  name: string;
  description?: string | null;
  cover_watchlist_id?: string | null;
  cover_item?: { poster_path: string | null; title: string } | null;
  watchlist_collections?: {
    watchlist_id: string;
    position: number;
    watchlist: {
      id: string;
      title: string;
      type: "movie" | "tv";
      status: "want" | "watching" | "watched";
      poster_path?: string | null;
      release_year?: number | null;
      tmdb_rating?: number | null;
    };
  }[];
};

export function CollectionCard({ 
  collection, 
  allWatchlistItems 
}: { 
  collection: Collection;
  allWatchlistItems: any[];
}) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  const items = collection.watchlist_collections || [];
  
  const stats = {
    movies: items.filter(i => i.watchlist.type === "movie").length,
    tv: items.filter(i => i.watchlist.type === "tv").length,
    watched: items.filter(i => i.watchlist.status === "watched").length,
  };

  const posters = items
    .sort((a, b) => a.position - b.position)
    .filter(i => i.watchlist.poster_path)
    .map(i => i.watchlist.poster_path!);

  const displayPosters = posters.slice(0, 4);
  const remaining = posters.length - 4;

  const executeDelete = () => {
    startTransition(async () => {
      const res = await deleteCollection(collection.id);
      if (res && !res.success) toast.error(res.error || "Failed to delete collection");
      else toast.success("Collection deleted");
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEdit(true);
  };

  const handleCardClick = () => {
    router.push(`/watchlist/collections/${collection.id}`);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-col bg-card rounded-[20px] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1"
        style={{ 
          boxShadow: isHovered 
            ? "0 4px 12px rgba(0,0,0,0.1), 0 12px 32px rgba(0,0,0,0.15)" 
            : "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)" 
        }}
      >
        
        {/* TOP SECTION: Cover */}
        <div className="relative h-[160px] w-full flex-shrink-0">
          {collection.cover_item?.poster_path ? (
            <>
              <Image 
                src={collection.cover_item.poster_path} 
                alt={collection.name} 
                fill 
                className="object-cover" 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <h3 
                className="absolute bottom-3 left-4 text-white text-[18px] font-bold"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
              >
                {collection.name}
              </h3>
            </>
          ) : (
            <div 
              className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}
            >
              <Library className="w-8 h-8 text-white/50 mb-2" />
              <h3 className="text-white text-[18px] font-bold leading-tight">{collection.name}</h3>
            </div>
          )}
        </div>

        {/* POSTER STRIP */}
        <div className="relative z-10 px-4 -mt-6 h-12 flex items-center">
          {displayPosters.map((poster, idx) => (
            <div 
              key={idx} 
              className={`relative w-8 h-12 rounded-[6px] overflow-hidden border-2 border-card shadow-sm ${idx > 0 ? "-ml-2" : ""}`}
            >
              <Image src={poster} alt="Poster" fill className="object-cover" sizes="32px" />
            </div>
          ))}
          {remaining > 0 && (
            <div className="relative -ml-2 h-6 px-2 bg-slate-200 dark:bg-slate-700 border-2 border-card rounded-[20px] flex items-center justify-center text-[11px] font-medium z-10">
              +{remaining}
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: Stats */}
        <div className="bg-card px-4 pt-1 pb-3 flex items-center justify-between min-h-[48px]">
          <div className="flex items-center gap-3 text-[12px] text-muted-foreground font-medium">
            <span>🎬 {stats.movies} Movies</span>
            <span>📺 {stats.tv} TV</span>
            <span>✅ {stats.watched} Watched</span>
          </div>

          <div className={`flex items-center gap-1 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <button 
              onClick={handleEdit}
              disabled={pending}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-sky-100 hover:text-sky-600 dark:hover:bg-slate-800 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
              disabled={pending}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {showEdit && (
        <CreateCollectionModal
          initialData={collection}
          allWatchlistItems={allWatchlistItems}
          onClose={() => setShowEdit(false)}
        />
      )}
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={executeDelete}
        title="Delete Collection"
        description={`Are you sure you want to delete the collection '${collection.name}'? Your watchlist titles will not be affected.`}
      />
    </>
  );
}
