"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { 
  Home, ListTodo, Activity, Library, Apple, 
  Film, DollarSign, Calendar as CalendarIcon, Settings,
  Target, FileText
} from "lucide-react";
import "./command.css";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div 
        className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <Command label="Command Menu" className="flex flex-col w-full h-full">
          <Command.Input 
            placeholder="Type a command or search..." 
            className="w-full px-4 py-4 text-sm bg-transparent border-b border-border outline-none focus:ring-0 placeholder:text-muted-foreground"
            autoFocus
          />
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-medium text-muted-foreground px-2 py-1">
              <Command.Item onSelect={() => runCommand(() => router.push("/dashboard"))} className="cmd-item">
                <Home className="w-4 h-4 mr-2" /> Dashboard
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/tasks"))} className="cmd-item">
                <ListTodo className="w-4 h-4 mr-2" /> Tasks
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/habits"))} className="cmd-item">
                <Activity className="w-4 h-4 mr-2" /> Habits
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/goals"))} className="cmd-item">
                <Target className="w-4 h-4 mr-2" /> Goals
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/notes"))} className="cmd-item">
                <FileText className="w-4 h-4 mr-2" /> Notes
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/books"))} className="cmd-item">
                <Library className="w-4 h-4 mr-2" /> Books
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/nutrition"))} className="cmd-item">
                <Apple className="w-4 h-4 mr-2" /> Nutrition
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/watchlist"))} className="cmd-item">
                <Film className="w-4 h-4 mr-2" /> Watchlist
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/expenses"))} className="cmd-item">
                <DollarSign className="w-4 h-4 mr-2" /> Expenses
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/calendar"))} className="cmd-item">
                <CalendarIcon className="w-4 h-4 mr-2" /> Calendar
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push("/settings"))} className="cmd-item">
                <Settings className="w-4 h-4 mr-2" /> Settings
              </Command.Item>
            </Command.Group>
            
            <Command.Group heading="Actions" className="text-xs font-medium text-muted-foreground px-2 py-1 mt-2">
              <Command.Item onSelect={() => runCommand(() => {
                document.documentElement.classList.toggle('dark');
              })} className="cmd-item">
                Toggle Theme
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
