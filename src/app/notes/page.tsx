import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { NotesGrid } from "@/components/notes/NotesGrid";

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AppLayout title="Notes">
      <NotesGrid initialNotes={notes || []} />
    </AppLayout>
  );
}
