"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export async function addExpense(data: {
  amount: number; category: string; description: string;
  date: string; notes?: string; is_recurring?: boolean;
  recurring_frequency?: string; recurring_end_date?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  try {
    await supabase.from("expenses").insert({ ...data, user_id: user.id });
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Add expense error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateExpense(id: string, data: Partial<{
  amount: number; category: string; description: string;
  date: string; notes: string; is_recurring: boolean;
  recurring_frequency: string; recurring_end_date: string;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  try {
    await supabase.from("expenses").update(data).eq("id", id).eq("user_id", user.id);
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Update expense error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  try {
    await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Delete expense error:", error);
    return { success: false, error: error.message };
  }
}

export async function upsertBudget(category: string, amount: number, month: number, year: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  try {
    await supabase.from("budgets").upsert({ user_id: user.id, category, amount, month, year }, { onConflict: "user_id,category,month,year" });
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Upsert budget error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  try {
    await supabase.from("budgets").delete().eq("id", id).eq("user_id", user.id);
    revalidatePath("/expenses");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Delete budget error:", error);
    return { success: false, error: error.message };
  }
}
