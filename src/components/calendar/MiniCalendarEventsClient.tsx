"use client";

import { useState, useEffect } from "react";
import { fetchCalendarEvents } from "@/app/calendar/actions";
import { format } from "date-fns";

export function MiniCalendarEventsClient({ 
  timeMin, 
  timeMax 
}: { 
  timeMin: string; 
  timeMax: string; 
}) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      const res = await fetchCalendarEvents(timeMin, timeMax);
      if (res.success && res.events) {
        setEvents(res.events);
      }
      setLoading(false);
    }
    loadEvents();
  }, [timeMin, timeMax]);

  if (loading) {
    return (
      <div className="flex-1 space-y-1 overflow-y-auto pr-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        <div className="text-sm text-muted-foreground italic h-full flex items-center justify-center">
          No events scheduled for today.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-1 overflow-y-auto pr-1">
      {events.map((event, i) => {
        const isAllDay = !!event.start.date;
        const startTime = isAllDay ? "All day" : format(new Date(event.start.dateTime), "h:mm a");
        const eventColor = event.colorId ? '#0ea5e9' : 'var(--primary)';

        return (
          <div key={event.id || i} className="group">
            <div className="flex items-center gap-3 p-2 rounded-[8px] transition-colors hover:bg-muted">
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: eventColor }} 
              />
              <p className="font-medium text-sm line-clamp-1 flex-1 text-foreground" title={event.summary}>
                {event.summary}
              </p>
              <p className="text-[12px] text-muted-foreground text-right whitespace-nowrap ml-2">
                {startTime}
              </p>
            </div>
            {i < events.length - 1 && (
              <div className="h-[0.5px] bg-border/40 mx-2 my-0.5 group-hover:bg-transparent transition-colors" />
            )}
          </div>
        );
      })}
    </div>
  );
}
