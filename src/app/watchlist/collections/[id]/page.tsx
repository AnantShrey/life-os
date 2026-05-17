import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { CollectionDetailView } from "@/components/watchlist/CollectionDetailView";
import { redirect } from "next/navigation";

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: collection, error } = await supabase
    .from("collections")
    .select(`
      *,
      cover_item:watchlist!cover_watchlist_id (poster_path, title),
      watchlist_collections (
        position,
        watchlist (*)
      )
    `)
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .single();

  if (error || !collection) {
    redirect("/watchlist?tab=collections");
  }

  // Fetch all watchlist items for the edit modal's cover image picker
  const { data: allItems } = await supabase
    .from("watchlist")
    .select("id, title, type, poster_path")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AppLayout title="Collection">
      <CollectionDetailView 
        collection={collection as any} 
        allWatchlistItems={allItems || []}
      />
    </AppLayout>
  );
}
