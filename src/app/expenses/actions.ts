"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addExpense(data: {
  amount: number; category: string; description: string;
  date: string; notes?: string; is_recurring?: boolean;
  recurring_frequency?: string; recurring_end_date?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  await supabase.from("expenses").insert({ ...data, user_id: user.id });
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function updateExpense(id: string, data: Partial<{
  amount: number; category: string; description: string;
  date: string; notes: string; is_recurring: boolean;
  recurring_frequency: string; recurring_end_date: string;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("expenses").update(data).eq("id", id).eq("user_id", user.id);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function upsertBudget(category: string, amount: number, month: number, year: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("budgets").upsert({ user_id: user.id, category, amount, month, year }, { onConflict: "user_id,category,month,year" });
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("budgets").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/expenses");
}
