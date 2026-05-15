import { createClient } from "@/utils/supabase/server";
import { AppLayout } from "@/components/layout/app-layout";
import { TaskList } from "./task-list";
import { addTask } from "./actions";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("completed", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  const { data: syncedEvents } = await supabase
    .from("synced_events")
    .select("source_id")
    .eq("user_id", user.id)
    .eq("source_type", "task");

  const syncedTaskIds = new Set(syncedEvents?.map(e => e.source_id));

  return (
    <AppLayout title="To-do List">
      <div className="max-w-2xl mx-auto">
        <form action={addTask} className="bg-card border border-border p-4 rounded-xl shadow-sm mb-8">
          <input
            type="text"
            name="title"
            placeholder="What needs to be done?"
            className="w-full bg-transparent text-lg focus:outline-none mb-4"
            required
          />
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-3">
              <input 
                type="date" 
                name="due_date"
                className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <select 
                name="priority"
                className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <button 
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>

        <TaskList tasks={tasks || []} syncedTaskIds={syncedTaskIds} />
      </div>
    </AppLayout>
  );
}
