import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { GoalsGrid } from "@/components/goals/GoalsGrid";
import { syncGoalsProgress } from "@/lib/goal-sync";

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Sync auto-tracked goals
  await syncGoalsProgress(user.id);

  // Fetch updated goals and milestones
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: milestones } = await supabase
    .from("goal_milestones")
    .select("*")
    .in("goal_id", (goals || []).map(g => g.id))
    .order("position", { ascending: true });

  return (
    <AppLayout title="Goals">
      <GoalsGrid goals={goals || []} milestones={milestones || []} />
    </AppLayout>
  );
}
