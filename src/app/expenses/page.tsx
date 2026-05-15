import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { getPreferences } from "@/app/settings/actions";
import { ExpensesClient } from "./expenses-client";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const prefs = await getPreferences();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [expensesRes, budgetsRes] = await Promise.all([
    supabase.from("expenses").select("*").eq("user_id", user.id)
      .gte("date", `${year}-${String(month).padStart(2,"0")}-01`)
      .lte("date", `${year}-${String(month).padStart(2,"0")}-31`)
      .order("date", { ascending: false }),
    supabase.from("budgets").select("*").eq("user_id", user.id).eq("month", month).eq("year", year),
  ]);

  return (
    <AppLayout title="Expense Tracker">
      <ExpensesClient
        initialExpenses={expensesRes.data || []}
        initialBudgets={budgetsRes.data || []}
        symbol={prefs.currency_symbol ?? "₹"}
        month={month}
        year={year}
      />
    </AppLayout>
  );
}
