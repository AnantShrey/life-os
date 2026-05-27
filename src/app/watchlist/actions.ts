"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export async function addToWatchlist(item: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Check if item already exists
  const { data: existing } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("tmdb_id", item.tmdb_id.toString())
    .single();

  if (existing) {
    return { success: false, error: "Already in your watchlist" };
  }

  const { data, error } = await supabase.from("watchlist").insert({
    user_id: user.id,
    tmdb_id: item.tmdb_id.toString(),
    type: item.type,
    title: item.title,
    poster_path: item.poster_path || null,
    backdrop_path: item.backdrop_path || null,
    overview: item.overview || null,
    release_year: item.release_year || null,
    genres: item.genres || null,
    tmdb_rating: item.tmdb_rating || null,
    status: item.status,
    rating: item.rating || null,
    notes: item.notes || null,
    current_season: item.current_season || null,
    current_episode: item.current_episode || null,
  }).select();

  if (error) {
    logger.error("Supabase insert error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/watchlist");
  revalidatePath("/dashboard");
  return { success: true, data };
}

export async function updateWatchlistItem(id: string, data: Record<string, any>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  try {
    await supabase.from("watchlist").update(data).eq("id", id).eq("user_id", user.id);
    revalidatePath("/watchlist");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Update watchlist item error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteWatchlistItem(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  try {
    await supabase.from("watchlist").delete().eq("id", id).eq("user_id", user.id);
    revalidatePath("/watchlist");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) { const error = e as Error;
    logger.error("Delete watchlist item error:", error);
    return { success: false, error: error.message };
  }
}

export async function createCollection(data: { name: string; description?: string | null; cover_watchlist_id?: string | null }, itemIds: string[] = []) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: collection, error: colError } = await supabase.from("collections").insert({
    user_id: user.id,
    name: data.name,
    description: data.description || null,
    cover_watchlist_id: data.cover_watchlist_id || null,
  }).select().single();

  if (colError) return { success: false, error: colError.message };

  if (itemIds.length > 0) {
    const records = itemIds.map((id, index) => ({
      watchlist_id: id,
      collection_id: collection.id,
      position: index,
    }));
    await supabase.from("watchlist_collections").insert(records);
  }

  revalidatePath("/watchlist");
  return { success: true, data: collection };
}

export async function updateCollection(id: string, data: { name?: string; description?: string | null; cover_watchlist_id?: string | null }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("collections").update(data).eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/watchlist");
  revalidatePath(`/watchlist/collections/${id}`);
  return { success: true };
}

export async function deleteCollection(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("collections").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/watchlist");
  return { success: true };
}

export async function toggleWatchlistCollection(watchlistId: string, collectionId: string, isAdding: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (isAdding) {
    const { data: existing } = await supabase.from("watchlist_collections").select("*")
      .eq("watchlist_id", watchlistId).eq("collection_id", collectionId).single();
    if (!existing) {
      await supabase.from("watchlist_collections").insert({ watchlist_id: watchlistId, collection_id: collectionId });
    }
  } else {
    await supabase.from("watchlist_collections").delete()
      .eq("watchlist_id", watchlistId).eq("collection_id", collectionId);
  }

  revalidatePath("/watchlist");
  revalidatePath(`/watchlist/collections/${collectionId}`);
  return { success: true };
}

export async function updateCollectionPositions(collectionId: string, orderedWatchlistIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Verify ownership of the collection
  const { data: col } = await supabase.from("collections").select("id").eq("id", collectionId).eq("user_id", user.id).single();
  if (!col) return { success: false, error: "Not authorized" };

  // To update positions easily, we can delete the current items and re-insert them, 
  // or we can use an upsert. We'll use upsert.
  const records = orderedWatchlistIds.map((wId, i) => ({
    watchlist_id: wId,
    collection_id: collectionId,
    position: i
  }));
  
  const { error } = await supabase.from("watchlist_collections").upsert(records, { onConflict: "watchlist_id, collection_id" });
  if (error) return { success: false, error: error.message };

  revalidatePath(`/watchlist/collections/${collectionId}`);
  return { success: true };
}
