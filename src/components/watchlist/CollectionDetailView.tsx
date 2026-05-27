"use client";
import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, GripVertical, X, ArrowLeft, Library } from "lucide-react";
import { updateCollectionPositions, toggleWatchlistCollection, deleteCollection } from "@/app/watchlist/actions";
import { WatchlistCard } from "@/components/watchlist/WatchlistCard";
import { CreateCollectionModal } from "@/components/watchlist/CreateCollectionModal";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function SortableWatchlistCard({ id, item, collectionId }: { id: string, item: any, collectionId: string }) {
  const [pending, startTransition] = useTransition();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      const res = await toggleWatchlistCollection(item.id, collectionId, false);
      if (res && !res.success) toast.error(res.error || "Failed to remove item");
      else toast.success("Removed from collection");
    });
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      <WatchlistCard item={item} />
      
      {/* Overlay Actions */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 left-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover/sortable:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-black/70 z-10"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <button
        onClick={handleRemove}
        disabled={pending}
        title="Remove from collection"
        className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover/sortable:opacity-100 transition-opacity hover:bg-red-500 z-10"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function CollectionDetailView({ 
  collection, 
  allWatchlistItems 
}: { 
  collection: any; 
  allWatchlistItems: any[];
}) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  const initialItems = useMemo(() => {
    return (collection.watchlist_collections || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((i: any) => i.watchlist);
  }, [collection]);

  const [items, setItems] = useState<any[]>(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Sync to server
        startTransition(() => {
          updateCollectionPositions(collection.id, newItems.map(i => i.id));
        });
        
        return newItems;
      });
    }
  };

  const executeDelete = () => {
    startTransition(async () => {
      const res = await deleteCollection(collection.id);
      if (res && !res.success) {
        toast.error(res.error || "Failed to delete collection");
      } else {
        toast.success("Collection deleted");
        router.push("/watchlist?tab=collections");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header / Banner Area */}
      <div className="relative rounded-[24px] overflow-hidden bg-card" style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}>
        <div className="absolute inset-0 z-0">
          {collection.cover_item?.poster_path ? (
            <>
              <Image 
                src={collection.cover_item.poster_path} 
                alt={collection.name} 
                fill 
                className="object-cover opacity-60" 
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/20 to-[#0284c7]/5" />
          )}
        </div>

        <div className="relative z-10 p-8 min-h-[200px] flex flex-col justify-end">
          <button 
            onClick={() => router.push("/watchlist?tab=collections")}
            className="self-start mb-auto inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-md px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" /> Watchlist
          </button>

          <div className="flex items-end justify-between gap-4 mt-6">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-foreground">{collection.name}</h1>
              {collection.description && (
                <p className="text-[15px] text-muted-foreground mt-1 max-w-2xl">{collection.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground bg-background/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                {items.length} title{items.length !== 1 ? 's' : ''}
              </span>
              <button 
                onClick={() => setShowEdit(true)}
                className="w-10 h-10 bg-background/50 backdrop-blur-md flex items-center justify-center rounded-full hover:bg-sky-500 hover:text-white transition-colors shadow-sm"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={pending}
                className="w-10 h-10 bg-background/50 backdrop-blur-md flex items-center justify-center rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-card rounded-[24px] border border-border/50">
          <span className="text-5xl mb-2">🎬</span>
          <h3 className="font-semibold text-lg">This collection is empty</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Add some titles from your watchlist to get started.
          </p>
          <button 
            onClick={() => router.push("/watchlist")}
            className="mt-2 text-primary text-sm font-medium hover:underline"
          >
            Go to Watchlist →
          </button>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items.map(i => i.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => (
                <SortableWatchlistCard 
                  key={item.id} 
                  id={item.id} 
                  item={item} 
                  collectionId={collection.id} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

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
        description={`Are you sure you want to delete the collection '${collection.name}'?`}
      />
    </div>
  );
}
