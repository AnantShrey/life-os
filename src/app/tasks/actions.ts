"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTask(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const title = formData.get("title") as string;
  const dueDate = formData.get("due_date") as string;
  const priority = formData.get("priority") as string || "medium";

  if (!title) return;

  try {
    await supabase.from("tasks").insert({
      user_id: user.id,
      title,
      due_date: dueDate ? dueDate : null,
      priority,
    });
    revalidatePath("/tasks");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Add task error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleTask(id: string, completed: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const updates: Record<string, any> = { completed };
  if (completed) {
    updates.completed_at = new Date().toISOString();
  } else {
    updates.completed_at = null;
  }

  try {
    await supabase.from("tasks").update(updates).eq("id", id).eq("user_id", user.id);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Toggle task error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id);
    revalidatePath("/tasks");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Delete task error:", error);
    return { success: false, error: error.message };
  }
}

import { getCalendarClient } from "@/lib/google-calendar";
import { logger } from "@/lib/logger";

export async function syncTaskToCalendar(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Check if connected
  const { data: connection } = await supabase.from("calendar_connections").select("is_active").eq("user_id", user.id).single();
  if (!connection?.is_active) return { success: false, error: "Calendar not connected" };

  // Check if already synced
  const { data: synced } = await supabase.from("synced_events").select("*").eq("source_id", taskId).single();
  if (synced) return { success: false, error: "Already synced" };

  // Get task details
  const { data: task } = await supabase.from("tasks").select("*").eq("id", taskId).single();
  if (!task) return { success: false, error: "Task not found" };

  try {
    const calendar = await getCalendarClient();
    
    // Determine date (default to today if no due date)
    const dateStr = task.due_date || new Date().toISOString().split('T')[0];
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: task.title,
        description: `Life Tracker task — ${task.priority} priority`,
        start: { date: dateStr },
        end: { date: dateStr },
        colorId: task.priority === "high" ? "11" : task.priority === "medium" ? "5" : "9", // Red, Yellow, Blue
      }
    });

    if (response.data.id) {
      await supabase.from("synced_events").insert({
        user_id: user.id,
        source_type: "task",
        source_id: taskId,
        google_event_id: response.data.id
      });
      
      revalidatePath("/tasks");
      return { success: true };
    }
  } catch (e) { const error = e as Error;
    logger.error("Sync error:", error);
    return { success: false, error: error.message };
  }
}
