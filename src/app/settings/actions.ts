"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPreferences() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { currency: "INR", currency_symbol: "₹" };
  const { data } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single();
  return data ?? { currency: "INR", currency_symbol: "₹" };
}

export async function savePreferences(currency: string, symbol: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("user_preferences").upsert({ user_id: user.id, currency, currency_symbol: symbol, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  revalidatePath("/settings");
  revalidatePath("/expenses");
}
