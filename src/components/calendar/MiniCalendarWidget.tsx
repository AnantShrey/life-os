import { createClient } from "@/utils/supabase/server";
import { MiniCalendarEventsClient } from "./MiniCalendarEventsClient";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export async function MiniCalendarWidget() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const hasRefreshToken = !!cookieStore.get("google_refresh_token")?.value;

  const { data: connection } = await supabase
    .from("calendar_connections")
    .select("is_active")
    .eq("user_id", user.id)
    .single();

  if (!connection?.is_active || !hasRefreshToken) {
    return (
      <div className="bg-card rounded-[20px] p-5 h-full flex flex-col items-center justify-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)] border-none">
        <Calendar className="w-8 h-8 text-muted-foreground mb-3" />
        <h3 className="font-semibold mb-1">Calendar Not Connected</h3>
        <p className="text-xs text-muted-foreground mb-4">Sync your Google Calendar to see upcoming events.</p>
        <Link href="/calendar" className="text-xs font-medium text-primary bg-primary/10 px-4 py-2 rounded-[10px] hover:bg-primary/20 transition-colors">
          Connect Now
        </Link>
      </div>
    );
  }

  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekStart = startOfWeek(today);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  return (
    <div className="bg-card rounded-[20px] p-5 h-full shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)] border-none flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Today's Events
        </h3>
        <Link href="/calendar" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
          Full calendar &rarr;
        </Link>
      </div>

      {/* Mini 7-day calendar */}
      <div className="flex justify-between items-center mb-5 pb-5 border-b border-border/50">
        {weekDays.map((date, i) => {
          const isToday = isSameDay(date, today);
          
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase">{format(date, "EE").charAt(0)}</span>
              <div 
                className={`w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-sm font-medium transition-colors ${
                  isToday 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {format(date, "d")}
              </div>
              {/* Removed dot indicator for SSR, events loaded on client */}
            </div>
          );
        })}
      </div>
      
      <MiniCalendarEventsClient 
        timeMin={todayStart.toISOString()} 
        timeMax={tomorrow.toISOString()} 
      />
    </div>
  );
}
