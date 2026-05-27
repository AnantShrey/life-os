"use server";

import { getCalendarClient } from "@/lib/google-calendar";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export async function fetchCalendarEvents(timeMin: string, timeMax: string) {
  try {
    const calendar = await getCalendarClient();
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return { success: true, events: response.data.items || [] };
  } catch (e) { const error = e as Error;
    logger.error("Failed to fetch calendar events:", error.message);
    return { success: false, error: error.message };
  }
}

export async function createCalendarEvent(eventData: any) {
  try {
    const calendar = await getCalendarClient();
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: eventData.title,
        description: eventData.description,
        start: eventData.allDay ? { date: eventData.start } : { dateTime: eventData.start },
        end: eventData.allDay ? { date: eventData.end } : { dateTime: eventData.end },
        colorId: eventData.colorId, // 1-11
      }
    });
    
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return { success: true, event: response.data };
  } catch (e) { const error = e as Error;
    return { success: false, error: error.message };
  }
}

export async function updateCalendarEvent(eventId: string, eventData: any) {
  try {
    const calendar = await getCalendarClient();
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: {
        summary: eventData.title,
        description: eventData.description,
        start: eventData.allDay ? { date: eventData.start } : { dateTime: eventData.start },
        end: eventData.allDay ? { date: eventData.end } : { dateTime: eventData.end },
        colorId: eventData.colorId,
      }
    });
    
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return { success: true, event: response.data };
  } catch (e) { const error = e as Error;
    return { success: false, error: error.message };
  }
}

export async function deleteCalendarEvent(eventId: string) {
  try {
    const calendar = await getCalendarClient();
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
    
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    return { success: false, error: error.message };
  }
}
