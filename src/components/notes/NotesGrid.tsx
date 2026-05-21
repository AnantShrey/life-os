"use client";
import { useState, useTransition, useMemo } from "react";
import { Plus, Search, StickyNote } from "lucide-react";
import { NoteCard, Note } from "./NoteCard";
import { createNote } from "@/app/notes/actions";

export function NotesGrid({ initialNotes }: { initialNotes: Note[] }) {
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  // We manage the "new note" via a temporary state before it's saved, but the user requested:
  // "Clicking creates a new blank note inline at the top of the grid"
  // Since we have a `createNote` server action, we can just call it to insert a blank note in DB
  // and it will appear at the top of the grid. If it's discarded on blur, it's deleted.

  const [newNoteId, setNewNoteId] = useState<string | null>(null);

  const handleNewNote = () => {
    startTransition(async () => {
      const res = await createNote();
      if (res.success && res.data) {
        setNewNoteId(res.data.id);
      }
    });
  };

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return initialNotes;
    const q = search.toLowerCase();
    return initialNotes.filter(n => 
      (n.title && n.title.toLowerCase().includes(q)) || 
      (n.content && n.content.toLowerCase().includes(q))
    );
  }, [initialNotes, search]);

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const otherNotes = filteredNotes.filter(n => !n.pinned);

  const hasPinned = pinnedNotes.length > 0;
  const hasOthers = otherNotes.length > 0;

  const MasonryGrid = ({ notes }: { notes: Note[] }) => (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
      {notes.map(note => (
        <NoteCard 
          key={note.id} 
          note={note} 
          isNew={note.id === newNoteId}
          onDiscard={() => {
            if (note.id === newNoteId) setNewNoteId(null);
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-sm text-muted-foreground">{filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}</p>
        </div>
        
        <button 
          onClick={handleNewNote}
          disabled={pending}
          className="flex items-center gap-2 px-4 py-2 rounded-[12px] text-[13px] font-medium text-white shadow-sm hover:brightness-110 transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)" }}
        >
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full bg-card border border-border rounded-[12px] py-3 pl-11 pr-4 text-[14px] focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all shadow-sm"
        />
      </div>

      {/* Grid */}
      <div className="mt-2 flex flex-col gap-8">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-card/50 rounded-[24px] border border-border/50 border-dashed">
            <StickyNote className="w-10 h-10 text-muted-foreground/50 mb-2" />
            <h3 className="font-semibold text-lg">No notes found</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {search ? "Try a different search term." : "Click 'New Note' to create your first note."}
            </p>
          </div>
        ) : (
          <>
            {hasPinned && (
              <section>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-4 pl-1">Pinned</p>
                <MasonryGrid notes={pinnedNotes} />
              </section>
            )}

            {hasOthers && (
              <section>
                {hasPinned && (
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-4 pl-1 mt-2">Others</p>
                )}
                <MasonryGrid notes={otherNotes} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
