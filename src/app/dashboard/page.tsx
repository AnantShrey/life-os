import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth } from "date-fns";

// Habits
import { HabitStreakCard } from "@/components/dashboard/HabitStreakCard";
import { TodayHabitsCard } from "@/components/dashboard/TodayHabitsCard";

// Tasks
import { WeeklyDonutCard } from "@/components/dashboard/WeeklyDonutCard";
import { PriorityBreakdownCard } from "@/components/dashboard/PriorityBreakdownCard";
import { DueTodayCard } from "@/components/dashboard/DueTodayCard";

// Books
import { CurrentlyReadingCard } from "@/components/dashboard/CurrentlyReadingCard";
import { WishlistPreviewCard } from "@/components/dashboard/WishlistPreviewCard";
import { ReadingStatsCard } from "@/components/dashboard/ReadingStatsCard";

// Expenses
import { SpendingDonutCard } from "@/components/dashboard/SpendingDonutCard";
import { BudgetProgressCard } from "@/components/dashboard/BudgetProgressCard";
import { SpendingTimelineCard } from "@/components/dashboard/SpendingTimelineCard";

// Watchlist
import { NowWatchingCard } from "@/components/dashboard/NowWatchingCard";
import { WatchlistStatsCard } from "@/components/dashboard/WatchlistStatsCard";
import { RecentlyAddedCard } from "@/components/dashboard/RecentlyAddedCard";

// Nutrition
import { CalorieRingCard } from "@/components/dashboard/CalorieRingCard";
import { MacrosCard } from "@/components/dashboard/MacrosCard";
import { WeeklyCalorieCard } from "@/components/dashboard/WeeklyCalorieCard";

// Notes
import { PinnedNotesCard } from "@/components/dashboard/PinnedNotesCard";

// Goals
import { GoalsDashboardCard } from "@/components/dashboard/GoalsDashboardCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startOfCurrMonth = format(startOfMonth(now), "yyyy-MM-dd");
  const endOfCurrMonth = format(endOfMonth(now), "yyyy-MM-dd");
  const startOfCurrWeek = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const endOfCurrWeek = format(addDays(new Date(startOfCurrWeek), 6), "yyyy-MM-dd");

  // Parallel data fetching
  const [
    habitsRes, habitLogsRes, 
    tasksRes, 
    booksRes, 
    prefsRes, 
    expensesRes, budgetsRes,
    watchlistRes,
    nutritionLogsRes, nutritionGoalsRes, nutritionWeeklyRes,
    notesRes,
    goalsRes
  ] = await Promise.all([
    // Habits
    supabase.from("habits").select("*").eq("user_id", user.id).eq("archived", false).order("created_at", { ascending: true }),
    supabase.from("habit_logs").select("habit_id, log_date, completed").eq("completed", true),
    
    // Tasks
    supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    
    // Books
    supabase.from("books").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    
    // Preferences
    supabase.from("user_preferences").select("*").eq("user_id", user.id).single(),
    
    // Expenses (Current month)
    supabase.from("expenses").select("*").eq("user_id", user.id).gte("date", startOfCurrMonth).lte("date", endOfCurrMonth),
    supabase.from("budgets").select("*").eq("user_id", user.id).eq("month", month).eq("year", year),
    
    // Watchlist
    supabase.from("watchlist").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    
    // Nutrition (Today)
    supabase.from("nutrition_logs").select("*").eq("user_id", user.id).eq("log_date", today),
    supabase.from("nutrition_goals").select("*").eq("user_id", user.id).single(),
    supabase.from("nutrition_logs").select("log_date, calories").eq("user_id", user.id).gte("log_date", startOfCurrWeek).lte("log_date", endOfCurrWeek),
    
    // Notes
    supabase.from("notes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
    
    // Goals
    supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const habits = habitsRes.data || [];
  const habitLogs = habitLogsRes.data || [];
  const tasks = tasksRes.data || [];
  const books = booksRes.data || [];
  const prefs = prefsRes.data || { currency_symbol: "₹" };
  const expenses = expensesRes.data || [];
  const budgets = budgetsRes.data || [];
  const watchlist = watchlistRes.data || [];
  const nutritionToday = nutritionLogsRes.data || [];
  const nutritionGoals = nutritionGoalsRes.data || { calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65 };
  const notes = notesRes.data || [];
  const goals = goalsRes.data || [];

  // Fetch milestones for the fetched goals
  const { data: milestonesRes } = await supabase
    .from("goal_milestones")
    .select("*")
    .in("goal_id", goals.map(g => g.id));
  const milestones = milestonesRes || [];
  
  // Group nutrition weekly data
  const nutritionWeekly = Array.from({ length: 7 }, (_, i) => {
    const d = format(addDays(new Date(startOfCurrWeek), i), "yyyy-MM-dd");
    const dayLogs = nutritionWeeklyRes.data?.filter(l => l.log_date === d) || [];
    const sum = dayLogs.reduce((s, l) => s + Number(l.calories), 0);
    return { date: d, calories: sum };
  });

  const nutritionTotals = nutritionToday.reduce((acc, log) => ({
    calories: acc.calories + Number(log.calories),
    protein: acc.protein + Number(log.protein_g),
    carbs: acc.carbs + Number(log.carbs_g),
    fat: acc.fat + Number(log.fat_g),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const dueTodayAll = tasks.filter((t) => t.due_date === today);
  const dueTodayPreview = dueTodayAll.slice(0, 5);

  const SectionLabel = ({ children }: { children: string }) => (
    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">
      {children}
    </p>
  );

  return (
    <AppLayout title="Dashboard">
      <style>{`
        .bento-card {
          background: var(--card);
          border-radius: 20px;
          padding: 20px 24px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04);
          overflow: hidden;
          height: 100%;
        }
        .dark .bento-card {
          box-shadow: 0 1px 2px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15);
        }
      `}</style>

      <div className="flex flex-col gap-12 max-w-7xl mx-auto pb-12">
        
        {/* HABITS */}
        <section>
          <SectionLabel>Habits</SectionLabel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7">
              <HabitStreakCard habits={habits} logs={habitLogs} today={today} />
            </div>
            <div className="col-span-12 md:col-span-5">
              <TodayHabitsCard habits={habits} logs={habitLogs} today={today} />
            </div>
          </div>
        </section>

        {/* TASKS */}
        <section>
          <SectionLabel>Tasks</SectionLabel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <WeeklyDonutCard tasks={tasks} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <PriorityBreakdownCard tasks={tasks} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <DueTodayCard tasks={dueTodayPreview} today={today} totalDueToday={dueTodayAll.length} />
            </div>
          </div>
        </section>

        {/* BOOKS */}
        <section>
          <SectionLabel>Books</SectionLabel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-8">
              <CurrentlyReadingCard books={books} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <WishlistPreviewCard books={books} />
            </div>
            <div className="col-span-12">
              <ReadingStatsCard books={books} />
            </div>
          </div>
        </section>

        {/* EXPENSES */}
        <section>
          <SectionLabel>Expenses</SectionLabel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <SpendingDonutCard expenses={expenses} budgets={budgets} symbol={prefs.currency_symbol} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <BudgetProgressCard budgets={budgets} expenses={expenses} symbol={prefs.currency_symbol} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <SpendingTimelineCard expenses={expenses} budgets={budgets} symbol={prefs.currency_symbol} />
            </div>
          </div>
        </section>

        {/* WATCHLIST */}
        <section>
          <SectionLabel>Watchlist</SectionLabel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-5">
              <NowWatchingCard items={watchlist} />
            </div>
            <div className="col-span-12 md:col-span-3">
              <WatchlistStatsCard items={watchlist} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <RecentlyAddedCard items={watchlist} />
            </div>
          </div>
        </section>

        {/* NUTRITION */}
        <section>
          <SectionLabel>Nutrition</SectionLabel>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <CalorieRingCard consumed={nutritionTotals.calories} goal={nutritionGoals.calories} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <MacrosCard protein={nutritionTotals.protein} carbs={nutritionTotals.carbs} fat={nutritionTotals.fat} goals={nutritionGoals} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <WeeklyCalorieCard data={nutritionWeekly} goal={nutritionGoals.calories} />
            </div>
          </div>
        </section>

        {/* NOTES & GOALS */}
        <section>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <SectionLabel>Notes</SectionLabel>
              <PinnedNotesCard notes={notes} />
            </div>
            <div className="col-span-12 md:col-span-8">
              <SectionLabel>Goals</SectionLabel>
              <GoalsDashboardCard goals={goals} milestones={milestones} />
            </div>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}
