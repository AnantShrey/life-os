"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addToWatchlist(item: {
  tmdb_id?: number; media_type: "movie" | "tv"; title: string;
  poster_path?: string | null; backdrop_path?: string | null;
  overview?: string; release_year?: number | null;
  genres?: string[]; tmdb_rating?: number | null;
  runtime?: number | null; total_seasons?: number | null;
  total_episodes?: number | null; status: "want" | "watching" | "watched";
  user_rating?: number; current_season?: number; current_episode?: number;
  personal_notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  await supabase.from("watchlist").insert({ ...item, user_id: user.id });
  revalidatePath("/watchlist");
  revalidatePath("/dashboard");
}

export async function updateWatchlistItem(id: string, data: Record<string, any>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("watchlist").update(data).eq("id", id).eq("user_id", user.id);
  revalidatePath("/watchlist");
  revalidatePath("/dashboard");
}

export async function deleteWatchlistItem(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("watchlist").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/watchlist");
  revalidatePath("/dashboard");
}
