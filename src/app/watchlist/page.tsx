import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { WatchlistClient } from "./watchlist-client";

export default async function WatchlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: items } = await supabase.from("watchlist").select("*")
    .eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <AppLayout title="Watchlist">
      <WatchlistClient items={items || []} />
    </AppLayout>
  );
}
