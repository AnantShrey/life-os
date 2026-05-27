"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGoal(goal: any, milestones?: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: newGoal, error } = await supabase.from("goals").insert({
    ...goal,
    user_id: user.id
  }).select().single();

  if (error) return { success: false, error: error.message };

  if (milestones && milestones.length > 0 && newGoal) {
    const msData = milestones.map((m, i) => ({
      goal_id: newGoal.id,
      title: m,
      position: i,
    }));
    await supabase.from("goal_milestones").insert(msData);
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true, data: newGoal };
}

export async function updateGoal(id: string, updates: Record<string, any>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("goals").update({
    ...updates,
    updated_at: new Date().toISOString()
  }).eq("id", id).eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleGoalCompletion(id: string, completed: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("goals").update({
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  }).eq("id", id).eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addMilestone(goalId: string, title: string, position: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("goal_milestones").insert({
    goal_id: goalId,
    title,
    position
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/goals");
  return { success: true };
}

export async function toggleMilestone(id: string, completed: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("goal_milestones").update({
    completed,
    completed_at: completed ? new Date().toISOString() : null
  }).eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/goals");
  return { success: true };
}

export async function deleteMilestone(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("goal_milestones").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/goals");
  return { success: true };
}

export async function updateMilestonePositions(updates: { id: string, position: number }[]) {
  const supabase = await createClient();
  // Supabase JS doesn't support bulk update easily without custom RPC or mapping promises.
  // We'll use a loop for now since it's typically < 10 milestones
  for (const u of updates) {
    await supabase.from("goal_milestones").update({ position: u.position }).eq("id", u.id);
  }
  revalidatePath("/goals");
  return { success: true };
}
