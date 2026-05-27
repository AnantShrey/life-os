"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";

export async function addHabit(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) return;

  try {
    await supabase.from("habits").insert({
      user_id: user.id,
      name,
      description: description ? description : null,
    });
  } catch (e) {
    const error = e as Error;
    logger.error("Add habit error:", error);
    redirect("/habits?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/habits");
  redirect("/habits");
}

export async function addHabitWithFrequency(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const frequency_type = (formData.get("frequency_type") as string) || "daily";
  const frequencyDaysRaw = formData.get("frequency_days") as string | null;
  const end_date = (formData.get("end_date") as string) || null;

  if (!name) return;

  let frequency_days: number[] | null = null;
  if (frequencyDaysRaw) {
    try { frequency_days = JSON.parse(frequencyDaysRaw); } catch {}
  }

  try {
    await supabase.from("habits").insert({
      user_id: user.id,
      name,
      description: description || null,
      frequency_type,
      frequency_days,
      end_date: end_date || null,
    });
  } catch (e) {
    const error = e as Error;
    logger.error("Add habit error:", error);
    redirect("/habits?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/habits");
  redirect("/habits");
}

export async function toggleHabitLog(habitId: string, logDate: string, currentlyCompleted: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    if (currentlyCompleted) {
      await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("log_date", logDate);
    } else {
      await supabase.from("habit_logs").insert({
        habit_id: habitId,
        log_date: logDate,
        completed: true,
      });
    }
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Toggle habit log error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteHabit(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from("habits").delete().eq("id", id).eq("user_id", user.id);
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Delete habit error:", error);
    return { success: false, error: error.message };
  }
}

import { getCalendarClient } from "@/lib/google-calendar";

export async function syncHabitToCalendar(habitId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: connection } = await supabase.from("calendar_connections").select("is_active").eq("user_id", user.id).single();
  if (!connection?.is_active) return { success: false, error: "Calendar not connected" };

  const { data: synced } = await supabase.from("synced_events").select("*").eq("source_id", habitId).single();
  if (synced) return { success: false, error: "Already synced" };

  const { data: habit } = await supabase.from("habits").select("*").eq("id", habitId).single();
  if (!habit) return { success: false, error: "Habit not found" };

  try {
    const calendar = await getCalendarClient();
    
    // Create a daily recurring event starting today
    const startDateStr = new Date().toISOString().split('T')[0];
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: habit.name,
        description: `Life Tracker habit`,
        start: { date: startDateStr },
        end: { date: startDateStr },
        recurrence: ['RRULE:FREQ=DAILY'],
        colorId: "2", // Sage Green
      }
    });

    if (response.data.id) {
      await supabase.from("synced_events").insert({
        user_id: user.id,
        source_type: "habit",
        source_id: habitId,
        google_event_id: response.data.id
      });
      
      revalidatePath("/habits");
      return { success: true };
    }
  } catch (e) { const error = e as Error;
    logger.error("Sync error:", error);
    return { success: false, error: error.message };
  }
}

export async function unsyncHabitFromCalendar(habitId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: synced } = await supabase.from("synced_events").select("*").eq("source_id", habitId).single();
  if (!synced) return { success: true }; // Nothing to do

  try {
    const calendar = await getCalendarClient();
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: synced.google_event_id,
    });

    await supabase.from("synced_events").delete().eq("id", synced.id);
    
    revalidatePath("/habits");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Unsync error:", error);
    return { success: false, error: error.message };
  }
}
