"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addNutritionLog(data: {
  log_date: string; food_name: string; calories: number;
  protein_g?: number; carbs_g?: number; fat_g?: number;
  fiber_g?: number; sugar_g?: number; sodium_mg?: number;
  serving_size?: string; meal_type: "breakfast"|"lunch"|"dinner"|"snack";
  food_api_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("nutrition_logs").insert({ ...data, user_id: user.id });
  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
}

export async function deleteNutritionLog(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("nutrition_logs").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
}

export async function saveNutritionGoals(goals: {
  calories: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("nutrition_goals").upsert(
    { ...goals, user_id: user.id, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
}
