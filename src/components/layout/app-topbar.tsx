import { LogOut } from "lucide-react";
import { logout } from "@/app/auth/actions";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppTopbar({ title }: { title: string }) {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 flex-shrink-0">
      <h2 className="text-lg font-semibold">{title}</h2>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <form action={logout}>
          <button 
            type="submit"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
