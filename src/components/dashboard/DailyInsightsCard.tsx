import { Lightbulb } from "lucide-react";
import { format } from "date-fns";

export function DailyInsightsCard({ 
  tasksDue, 
  tasksTotal, 
  habitsCompleted, 
  habitsTotal, 
  calories, 
  calorieGoal,
  expensesTotal,
  symbol,
  userName
}: {
  tasksDue: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
  calories: number;
  calorieGoal: number;
  expensesTotal: number;
  symbol: string;
  userName: string;
}) {
  const insights = [];

  // Tasks insight
  if (tasksDue > 0) {
    insights.push(`You have **${tasksDue} high-priority tasks** due today.`);
  } else if (tasksTotal > 0) {
    insights.push(`You have **${tasksTotal} tasks** remaining on your plate.`);
  } else {
    insights.push("Your task list is clear for today!");
  }

  // Habits insight
  if (habitsTotal > 0) {
    if (habitsCompleted === habitsTotal) {
      insights.push(`Amazing! You've completed **all your habits** today.`);
    } else {
      insights.push(`You've completed **${habitsCompleted}/${habitsTotal} habits**. Keep it up!`);
    }
  }

  // Nutrition insight
  if (calories > 0) {
    if (calories > calorieGoal) {
      insights.push(`You are **${calories - calorieGoal} kcal over** your daily goal.`);
    } else {
      insights.push(`You have **${calorieGoal - calories} kcal remaining** for today.`);
    }
  }

  // Expenses insight
  if (expensesTotal > 0) {
    insights.push(`You've spent **${symbol}${expensesTotal.toFixed(2)}** this month.`);
  }

  return (
    <div className="bento-card relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      
      <div className="relative z-10 flex items-start gap-4">
        <div className="p-3 bg-primary/20 rounded-xl text-primary mt-1">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-1">Good {format(new Date(), 'a') === 'AM' ? 'Morning' : 'Evening'}, {userName}</h2>
          <p className="text-sm text-muted-foreground mb-4">Here's a quick summary of your day:</p>
          
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<span class="font-medium text-foreground">$1</span>') }} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
