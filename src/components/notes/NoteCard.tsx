"use client";
import { useState, useRef, useEffect, useTransition } from "react";
import { Pin, Palette, Trash2, CheckCircle2 } from "lucide-react";
import { updateNote, deleteNote, togglePin, changeColor } from "@/app/notes/actions";
import { ColorPicker } from "./ColorPicker";

export type Note = {
  id: string;
  title: string | null;
  content: string | null;
  color: string;
  pinned: boolean;
};

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

export function NoteCard({ note, isNew = false, onDiscard }: { note: Note; isNew?: boolean; onDiscard?: () => void }) {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [isHovered, setIsHovered] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [pending, startTransition] = useTransition();

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textareas
  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    adjustHeight(titleRef.current);
    adjustHeight(contentRef.current);
  }, [title, content]);

  useEffect(() => {
    if (isNew && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isNew]);

  const handleTextChange = (field: "title" | "content", val: string) => {
    if (field === "title") setTitle(val);
    else setContent(val);

    setSaveStatus("saving");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      startTransition(async () => {
        const newTitle = field === "title" ? val : title;
        const newContent = field === "content" ? val : content;
        
        // If it's a new note and it's empty, we might discard it, but backend already created it. 
        // Actually, if it's completely empty on blur, we should delete it.
        await updateNote(note.id, { title: newTitle, content: newContent });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      });
    }, 1000);
  };

  const handleBlur = () => {
    if (isNew && !title.trim() && !content.trim()) {
      startTransition(async () => {
        await deleteNote(note.id);
        if (onDiscard) onDiscard();
      });
    }
  };

  const handleDelete = () => {
    startTransition(() => {
      deleteNote(note.id);
    });
  };

  const handlePin = () => {
    startTransition(() => {
      togglePin(note.id, !note.pinned);
    });
  };

  const handleColor = (c: string) => {
    startTransition(() => {
      changeColor(note.id, c);
    });
  };

  const colorClasses = NOTE_COLORS[note.color] || NOTE_COLORS.default;

  return (
    <div 
      className={`group relative rounded-[16px] p-4 border transition-all duration-200 ${colorClasses} mb-4 break-inside-avoid`}
      style={{ 
        boxShadow: isHovered ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
        transform: isHovered ? "scale(1.01)" : "scale(1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowColorPicker(false);
        setShowDeleteConfirm(false);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          handleBlur();
        }
      }}
    >
      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => handleTextChange("title", e.target.value)}
        placeholder="Title"
        rows={1}
        className="w-full bg-transparent resize-none overflow-hidden outline-none font-semibold text-[15px] placeholder:text-muted-foreground/60 mb-2"
      />
      
      <textarea
        ref={contentRef}
        value={content}
        onChange={(e) => handleTextChange("content", e.target.value)}
        placeholder="Take a note..."
        rows={1}
        className="w-full bg-transparent resize-none overflow-hidden outline-none text-[14px] leading-[1.6] text-slate-700 dark:text-slate-300 placeholder:text-muted-foreground/60 max-h-[250px] overflow-y-auto"
      />

      {saveStatus === "saved" && (
        <div className="absolute top-4 right-4 text-muted-foreground flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium opacity-50 animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-3 h-3" /> Saved
        </div>
      )}

      {/* Action Bar */}
      <div className={`mt-3 pt-2 flex items-center gap-2 transition-opacity duration-200 ${isHovered || isNew ? "opacity-100" : "opacity-0"}`}>
        <button
          onClick={handlePin}
          disabled={pending}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            note.pinned 
              ? "text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-950/30" 
              : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"
          }`}
          title={note.pinned ? "Unpin note" : "Pin note"}
        >
          <Pin className={`w-4 h-4 ${note.pinned ? "fill-current" : ""}`} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            disabled={pending}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Change color"
          >
            <Palette className="w-4 h-4" />
          </button>
          {showColorPicker && (
            <ColorPicker selected={note.color} onSelect={handleColor} onClose={() => setShowColorPicker(false)} />
          )}
        </div>

        <div className="relative ml-auto">
          {showDeleteConfirm ? (
            <div className="absolute bottom-0 right-0 bg-card border border-border shadow-md rounded-[12px] p-2 flex items-center gap-2 whitespace-nowrap z-20 animate-in slide-in-from-right-2">
              <span className="text-[11px] font-medium text-muted-foreground px-1">Delete note?</span>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-[11px] px-2 py-1 hover:bg-muted rounded-[6px]">Cancel</button>
              <button onClick={handleDelete} className="text-[11px] px-2 py-1 bg-red-500 text-white hover:bg-red-600 rounded-[6px]">Delete</button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={pending}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
