"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function updateDisplayName(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const name = formData.get("name") as string;

  if (!name || !name.trim()) {
    return redirect("/settings?error=Name cannot be empty");
  }

  try {
    await supabase.from("user_preferences").upsert({
      user_id: user.id,
      display_name: name,
    }, { onConflict: "user_id" });
    
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    redirect("/settings?success=Name updated");
  } catch (error) {
    console.error("Update name error:", error);
    return redirect("/settings?error=Failed to update name");
  }
}
