import { createClient } from "@/utils/supabase/server";
import { format, startOfWeek, startOfMonth, startOfYear } from "date-fns";

export async function syncGoalsProgress(userId: string) {
  const supabase = await createClient();
  
  // 1. Fetch all linked progress goals for the user
  const { data: linkedGoals, error: fetchError } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .not("linked_module", "is", null)
    .not("linked_metric", "is", null);

  if (fetchError || !linkedGoals || linkedGoals.length === 0) return;

  const now = new Date();
  
  // Helper to get date boundaries based on timeframe
  const getDateBoundary = (timeframe: string) => {
    switch (timeframe) {
      case "this_week": return format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "this_month": return format(startOfMonth(now), "yyyy-MM-dd");
      case "this_year": return format(startOfYear(now), "yyyy-MM-dd");
      default: return null; // 'overall'
    }
  };

  // 2. Iterate through goals and update them
  for (const goal of linkedGoals) {
    const boundary = getDateBoundary(goal.timeframe);
    let newValue = 0;

    switch (goal.linked_module) {
      case "books":
        if (goal.linked_metric === "books_finished") {
          let query = supabase.from("books").select("*", { count: "exact", head: true })
            .eq("user_id", userId).eq("status", "finished");
          if (boundary) query = query.gte("finished_at", boundary);
          const { count } = await query;
          newValue = count || 0;
        } else if (goal.linked_metric === "books_read_pages") {
          const { data } = await supabase.from("books").select("current_page")
            .eq("user_id", userId).eq("status", "reading");
          newValue = (data || []).reduce((sum, b) => sum + (b.current_page || 0), 0);
        }
        break;

      case "habits":
        if (goal.linked_metric === "habits_streak") {
          // Simplification for server sync: query all habits and logs, calculate max streak
          const { data: habits } = await supabase.from("habits").select("id").eq("user_id", userId);
          const { data: logs } = await supabase.from("habit_logs").select("habit_id, log_date").eq("completed", true);
          if (habits && logs) {
            let maxStreak = 0;
            const todayStr = format(now, "yyyy-MM-dd");
            const yesterdayStr = format(new Date(now.getTime() - 86400000), "yyyy-MM-dd");
            for (const h of habits) {
              const hLogs = logs.filter(l => l.habit_id === h.id).map(l => l.log_date).sort().reverse();
              let streak = 0;
              let currentStr = todayStr;
              if (!hLogs.includes(todayStr) && hLogs.includes(yesterdayStr)) {
                currentStr = yesterdayStr;
              }
              for (const logDate of hLogs) {
                if (logDate === currentStr) {
                  streak++;
                  currentStr = format(new Date(new Date(currentStr).getTime() - 86400000), "yyyy-MM-dd");
                } else if (logDate < currentStr) {
                  break;
                }
              }
              if (streak > maxStreak) maxStreak = streak;
            }
            newValue = maxStreak;
          }
        } else if (goal.linked_metric === "perfect_days") {
          let query = supabase.from("habit_logs").select("log_date").eq("completed", true);
          const { data: logs } = await query;
          const { count: totalHabits } = await supabase.from("habits").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("archived", false);
          if (logs && totalHabits) {
            const dateCounts: Record<string, number> = {};
            for (const l of logs) {
              if (!boundary || l.log_date >= boundary) {
                dateCounts[l.log_date] = (dateCounts[l.log_date] || 0) + 1;
              }
            }
            newValue = Object.values(dateCounts).filter(c => c >= totalHabits).length;
          }
        }
        break;

      case "tasks":
        if (goal.linked_metric === "tasks_completed") {
          let query = supabase.from("tasks").select("*", { count: "exact", head: true })
            .eq("user_id", userId).eq("completed", true);
          if (boundary) query = query.gte("updated_at", boundary);
          const { count } = await query;
          newValue = count || 0;
        }
        break;

      case "nutrition":
        if (goal.linked_metric === "calories_avg" || goal.linked_metric === "protein_avg") {
          let query = supabase.from("nutrition_logs").select("log_date, calories, protein_g").eq("user_id", userId);
          if (boundary) query = query.gte("log_date", boundary);
          const { data: nutLogs } = await query;
          if (nutLogs && nutLogs.length > 0) {
            const dailySums: Record<string, number> = {};
            nutLogs.forEach(l => {
              const val = goal.linked_metric === "calories_avg" ? Number(l.calories || 0) : Number(l.protein_g || 0);
              dailySums[l.log_date] = (dailySums[l.log_date] || 0) + val;
            });
            const days = Object.keys(dailySums).length;
            const total = Object.values(dailySums).reduce((a, b) => a + b, 0);
            newValue = days > 0 ? Math.round(total / days) : 0;
          }
        }
        break;

      case "expenses":
        if (goal.linked_metric === "total_spent" || goal.linked_metric === "under_budget") {
          let query = supabase.from("expenses").select("amount").eq("user_id", userId);
          if (boundary) query = query.gte("date", boundary);
          const { data: exps } = await query;
          const totalSpent = (exps || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
          
          if (goal.linked_metric === "total_spent") {
            newValue = totalSpent;
          } else if (goal.linked_metric === "under_budget") {
            // Check budget for current timeframe
            // Simplification: just check current month budget if timeframe is month
            if (goal.timeframe === "this_month") {
              const { data: budgets } = await supabase.from("budgets").select("amount")
                .eq("user_id", userId).eq("month", now.getMonth() + 1).eq("year", now.getFullYear());
              const totalBudget = (budgets || []).reduce((sum, b) => sum + Number(b.amount || 0), 0);
              newValue = totalSpent <= totalBudget && totalBudget > 0 ? 1 : 0; // boolean mapped to 0/1
            }
          }
        }
        break;

      case "watchlist":
        if (goal.linked_metric === "titles_watched") {
          // Watchlist doesn't have a specific completed_at standard in this simplified schema, so we just check status and maybe updated_at
          let query = supabase.from("watchlist").select("*", { count: "exact", head: true })
            .eq("user_id", userId).eq("status", "watched");
          if (boundary) query = query.gte("updated_at", boundary);
          const { count } = await query;
          newValue = count || 0;
        }
        break;
    }

    // Only update if value changed
    if (newValue !== Number(goal.current_value)) {
      await supabase.from("goals").update({ 
        current_value: newValue,
        updated_at: new Date().toISOString()
      }).eq("id", goal.id);
    }
  }
}
