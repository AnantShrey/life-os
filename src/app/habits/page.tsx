import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { HabitList } from "./habit-list";
import { HabitCreateForm } from "./habit-create-form";
import { format } from "date-fns";

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const today = format(new Date(), "yyyy-MM-dd");

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .eq("archived", false)
    .order("created_at", { ascending: true });

  const habitIds = habits && habits.length > 0 ? habits.map((h) => h.id) : [];

  let todayLogs: any[] = [];
  if (habitIds.length > 0) {
    const { data } = await supabase
      .from("habit_logs")
      .select("*")
      .in("habit_id", habitIds)
      .eq("log_date", today);
    todayLogs = data || [];
  }

  const { data: syncedEvents } = await supabase
    .from("synced_events")
    .select("source_id")
    .eq("user_id", user.id)
    .eq("source_type", "habit");

  const syncedHabitIds = new Set(syncedEvents?.map(e => e.source_id));

  return (
    <AppLayout title="Habit Tracker">
      <div className="max-w-3xl mx-auto">
        <HabitCreateForm />

        <div className="mb-4">
          <h2 className="text-xl font-bold">Your Habits</h2>
          <p className="text-muted-foreground text-sm">Check off your habits for {format(new Date(), "MMMM d, yyyy")}</p>
        </div>

        <HabitList habits={habits || []} todayLogs={todayLogs} syncedHabitIds={syncedHabitIds} />
      </div>
    </AppLayout>
  );
}
