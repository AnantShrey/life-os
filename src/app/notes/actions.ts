"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createNote() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase.from("notes").insert({
    user_id: user.id,
    title: "",
    content: "",
    color: "default",
    pinned: false,
  }).select().single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  return { success: true, data };
}

export async function updateNote(id: string, updates: { title?: string; content?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("notes").update({
    ...updates,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("notes").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function togglePin(id: string, isPinned: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("notes").update({ pinned: isPinned, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function changeColor(id: string, color: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("notes").update({ color, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  return { success: true };
}
