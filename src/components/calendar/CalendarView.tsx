"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { fetchCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/app/calendar/actions";
import { EventModal } from "./EventModal";

export function CalendarView() {
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Must match the COLORS constant in EventModal.tsx exactly
  const colors = [
    { id: "11", hex: "#ef4444" }, // Tomato
    { id: "4",  hex: "#f97316" }, // Flamingo
    { id: "6",  hex: "#f59e0b" }, // Tangerine
    { id: "5",  hex: "#eab308" }, // Banana
    { id: "2",  hex: "#84cc16" }, // Sage
    { id: "10", hex: "#22c55e" }, // Basil
    { id: "7",  hex: "#06b6d4" }, // Peacock
    { id: "9",  hex: "#3b82f6" }, // Blueberry (default)
  ];

  const getColorHex = (colorId?: string) => {
    return colors.find(c => c.id === colorId)?.hex || "#3b82f6";
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    // Fetch events for roughly the current month +/- a bit
    const timeMin = new Date();
    timeMin.setMonth(timeMin.getMonth() - 1);
    
    const timeMax = new Date();
    timeMax.setMonth(timeMax.getMonth() + 2);

    const res = await fetchCalendarEvents(timeMin.toISOString(), timeMax.toISOString());
    if (res.success && res.events) {
      const formattedEvents = res.events.map((e: any) => {
        const hex = getColorHex(e.colorId);
        return {
          id: e.id,
          title: e.summary,
          start: e.start?.dateTime || e.start?.date,
          end: e.end?.dateTime || e.end?.date,
          allDay: !!e.start?.date,
          // Tinted background at 15% opacity, solid left border
          backgroundColor: hex + "26", // 15% opacity hex suffix
          borderColor: hex,            // used by CSS for the left accent
          textColor: hex,
          extendedProps: {
            description: e.description,
            colorId: e.colorId,
          },
        };
      });
      setEvents(formattedEvents);
    }
    setIsLoading(false);
  };

  const handleDateClick = (arg: any) => {
    setSelectedEvent({
      allDay: arg.allDay,
      start: arg.dateStr,
      end: arg.dateStr
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: any) => {
    setSelectedEvent({
      id: arg.event.id,
      title: arg.event.title,
      start: arg.event.startStr,
      end: arg.event.endStr || arg.event.startStr,
      allDay: arg.event.allDay,
      backgroundColor: arg.event.backgroundColor,
      extendedProps: arg.event.extendedProps
    });
    setIsModalOpen(true);
  };

  const handleEventDrop = async (arg: any) => {
    const updatedEvent = {
      title: arg.event.title,
      description: arg.event.extendedProps.description,
      start: arg.event.startStr,
      end: arg.event.endStr || arg.event.startStr,
      allDay: arg.event.allDay,
      colorId: arg.event.extendedProps.colorId || "9"
    };
    await updateCalendarEvent(arg.event.id, updatedEvent);
  };

  const handleSaveModal = async (eventData: any) => {
    setIsModalOpen(false);
    
    // Optimistic UI update could go here
    if (eventData.id) {
      await updateCalendarEvent(eventData.id, eventData);
    } else {
      await createCalendarEvent(eventData);
    }
    
    loadEvents();
  };

  const handleDeleteModal = async (eventId: string) => {
    setIsModalOpen(false);
    await deleteCalendarEvent(eventId);
    loadEvents();
  };

  return (
    <div className="bg-card rounded-[24px] p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_4px_12px_rgba(0,0,0,0.15)] relative calendar-wrapper overflow-hidden border-none transition-all duration-200">
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center backdrop-blur-[2px] rounded-[24px]">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* 
        To make FullCalendar play nice with Tailwind dark mode, we add a class
        wrapper. FullCalendar CSS variables can be overridden in globals.css.
      */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        height="auto"
      />

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        onDelete={handleDeleteModal}
        initialEvent={selectedEvent}
      />
    </div>
  );
}
