import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all user data
    const [
      { data: tasks },
      { data: habits },
      { data: habitLogs },
      { data: expenses },
      { data: goals },
      { data: watchlist },
      { data: notes }
    ] = await Promise.all([
      supabase.from("tasks").select("*").eq("user_id", user.id),
      supabase.from("habits").select("*").eq("user_id", user.id),
      // For logs, we fetch where habit_id is in user's habits (Supabase can't do direct join on eq("user_id") if log doesn't have user_id, but habits do)
      supabase.from("habit_logs").select("*, habits!inner(user_id)").eq("habits.user_id", user.id),
      supabase.from("expenses").select("*").eq("user_id", user.id),
      supabase.from("goals").select("*").eq("user_id", user.id),
      supabase.from("watchlist").select("*").eq("user_id", user.id),
      supabase.from("notes").select("*").eq("user_id", user.id)
    ]);

    const exportData = {
      export_date: new Date().toISOString(),
      user: { id: user.id, email: user.email },
      tasks: tasks || [],
      habits: habits || [],
      habitLogs: habitLogs?.map(l => ({ ...l, habits: undefined })) || [], // remove inner join noise
      expenses: expenses || [],
      goals: goals || [],
      watchlist: watchlist || [],
      notes: notes || []
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="life_os_export_${new Date().toISOString().split('T')[0]}.json"`
      }
    });

  } catch (error) {
    logger.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
