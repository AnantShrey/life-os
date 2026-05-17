import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { WatchlistGrid } from "@/components/watchlist/WatchlistGrid";

export default async function WatchlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: items } = await supabase
    .from("watchlist")
    .select(`
      *,
      watchlist_collections (
        collection_id,
        position,
        collections (id, name)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: collections } = await supabase
    .from("collections")
    .select(`
      *,
      cover_item:watchlist!cover_watchlist_id (poster_path, title),
      watchlist_collections (
        watchlist_id,
        position,
        watchlist (
          id, title, type, status, poster_path, release_year, tmdb_rating
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AppLayout title="Watchlist">
      <WatchlistGrid items={items || []} collections={collections || []} />
    </AppLayout>
  );
}
