"use client";
import Link from "next/link";
import { Pin, StickyNote } from "lucide-react";
import { Note } from "@/components/notes/NoteCard";

const NOTE_COLORS: Record<string, string> = {
  default: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
  red:     "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
  orange:  "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800",
  yellow:  "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
  green:   "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  teal:    "bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800",
  blue:    "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  purple:  "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
  pink:    "bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800",
};

export function PinnedNotesCard({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <div className="bento-card flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <Pin className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-[17px]">Pinned Notes</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center pb-2">
          <StickyNote className="w-6 h-6 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium mb-1">No notes yet</p>
          <Link href="/notes" className="text-xs text-primary hover:underline">
            + New Note &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const pinned = notes.filter(n => n.pinned);
  const unpinned = notes.filter(n => !n.pinned);
  
  // Fill up to 3 slots
  const displayNotes = [...pinned];
  if (displayNotes.length < 3) {
    const needed = 3 - displayNotes.length;
    displayNotes.push(...unpinned.slice(0, needed));
  }
  
  const finalNotes = displayNotes.slice(0, 3);

  return (
    <div className="bento-card flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Pin className="w-5 h-5 text-amber-500" />
        <h2 className="font-bold text-[17px]">Pinned Notes</h2>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {finalNotes.map(note => {
          const colorClasses = NOTE_COLORS[note.color] || NOTE_COLORS.default;
          return (
            <div key={note.id} className={`rounded-[12px] p-3 border-[0.5px] ${colorClasses}`}>
              {note.title && (
                <h4 className="font-semibold text-[13px] truncate mb-0.5 text-slate-800 dark:text-slate-200">
                  {note.title}
                </h4>
              )}
              {note.content && (
                <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {note.content}
                </p>
              )}
              {!note.title && !note.content && (
                <p className="text-[12px] text-muted-foreground/50 italic">Empty note</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {pinned.length === 0 ? (
          <Link href="/notes" className="text-xs text-muted-foreground hover:text-foreground">
            + Pin a note
          </Link>
        ) : (
          <span />
        )}
        <Link href="/notes" className="text-xs text-primary font-medium hover:underline ml-auto">
          View all notes &rarr;
        </Link>
      </div>
    </div>
  );
}
