import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { NutritionClient } from "./nutrition-client";
import { format, startOfWeek, addDays } from "date-fns";

export default async function NutritionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = format(new Date(), "yyyy-MM-dd");
  const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const end = format(addDays(new Date(start), 6), "yyyy-MM-dd");

  const [logsRes, goalsRes, weeklyRes] = await Promise.all([
    supabase.from("nutrition_logs").select("*").eq("user_id", user.id).eq("log_date", today),
    supabase.from("nutrition_goals").select("*").eq("user_id", user.id).single(),
    supabase.from("nutrition_logs").select("log_date, calories").eq("user_id", user.id).gte("log_date", start).lte("log_date", end),
  ]);

  // Group weekly logs by day
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = format(addDays(new Date(start), i), "yyyy-MM-dd");
    const dayLogs = weeklyRes.data?.filter(l => l.log_date === d) || [];
    const sum = dayLogs.reduce((s, l) => s + Number(l.calories), 0);
    return { date: d, calories: sum };
  });

  return (
    <AppLayout title="Nutrition Tracker">
      <NutritionClient 
        initialLogs={logsRes.data || []} 
        goals={goalsRes.data}
        weeklyData={weeklyData}
      />
    </AppLayout>
  );
}
