-- Enable RLS on all tables
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS books ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS calendar_connections ENABLE ROW LEVEL SECURITY;

-- 1. tasks
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
CREATE POLICY "Users can manage their own tasks" ON tasks
    FOR ALL USING (auth.uid() = user_id);

-- 2. subtasks (references tasks.id)
DROP POLICY IF EXISTS "Users can manage subtasks of their tasks" ON subtasks;
CREATE POLICY "Users can manage subtasks of their tasks" ON subtasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = subtasks.task_id
            AND tasks.user_id = auth.uid()
        )
    );

-- 3. habits
DROP POLICY IF EXISTS "Users can manage their own habits" ON habits;
CREATE POLICY "Users can manage their own habits" ON habits
    FOR ALL USING (auth.uid() = user_id);

-- 4. habit_logs (references habits.id)
DROP POLICY IF EXISTS "Users can manage habit logs of their habits" ON habit_logs;
CREATE POLICY "Users can manage habit logs of their habits" ON habit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM habits
            WHERE habits.id = habit_logs.habit_id
            AND habits.user_id = auth.uid()
        )
    );

-- 5. books
DROP POLICY IF EXISTS "Users can manage their own books" ON books;
CREATE POLICY "Users can manage their own books" ON books
    FOR ALL USING (auth.uid() = user_id);

-- 6. expenses
DROP POLICY IF EXISTS "Users can manage their own expenses" ON expenses;
CREATE POLICY "Users can manage their own expenses" ON expenses
    FOR ALL USING (auth.uid() = user_id);

-- 7. budgets
DROP POLICY IF EXISTS "Users can manage their own budgets" ON budgets;
CREATE POLICY "Users can manage their own budgets" ON budgets
    FOR ALL USING (auth.uid() = user_id);

-- 8. watchlist
DROP POLICY IF EXISTS "Users can manage their own watchlist" ON watchlist;
CREATE POLICY "Users can manage their own watchlist" ON watchlist
    FOR ALL USING (auth.uid() = user_id);

-- 9. collections
DROP POLICY IF EXISTS "Users can manage their own collections" ON collections;
CREATE POLICY "Users can manage their own collections" ON collections
    FOR ALL USING (auth.uid() = user_id);

-- 10. collection_items (references collections.id)
DROP POLICY IF EXISTS "Users can manage items in their collections" ON collection_items;
CREATE POLICY "Users can manage items in their collections" ON collection_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_items.collection_id
            AND collections.user_id = auth.uid()
        )
    );

-- 11. nutrition_logs
DROP POLICY IF EXISTS "Users can manage their own nutrition logs" ON nutrition_logs;
CREATE POLICY "Users can manage their own nutrition logs" ON nutrition_logs
    FOR ALL USING (auth.uid() = user_id);

-- 12. nutrition_goals
DROP POLICY IF EXISTS "Users can manage their own nutrition goals" ON nutrition_goals;
CREATE POLICY "Users can manage their own nutrition goals" ON nutrition_goals
    FOR ALL USING (auth.uid() = user_id);

-- 13. goals
DROP POLICY IF EXISTS "Users can manage their own goals" ON goals;
CREATE POLICY "Users can manage their own goals" ON goals
    FOR ALL USING (auth.uid() = user_id);

-- 14. goal_milestones (references goals.id)
DROP POLICY IF EXISTS "Users can manage milestones of their goals" ON goal_milestones;
CREATE POLICY "Users can manage milestones of their goals" ON goal_milestones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM goals
            WHERE goals.id = goal_milestones.goal_id
            AND goals.user_id = auth.uid()
        )
    );

-- 15. notes
DROP POLICY IF EXISTS "Users can manage their own notes" ON notes;
CREATE POLICY "Users can manage their own notes" ON notes
    FOR ALL USING (auth.uid() = user_id);

-- 16. user_preferences
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- 17. calendar_connections
DROP POLICY IF EXISTS "Users can manage their own calendar connections" ON calendar_connections;
CREATE POLICY "Users can manage their own calendar connections" ON calendar_connections
    FOR ALL USING (auth.uid() = user_id);
