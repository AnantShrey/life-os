-- 1. Add new columns to the 'books' table for advanced tracking
ALTER TABLE books
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS started_reading_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_reading_time_ms BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_resumed_at TIMESTAMP WITH TIME ZONE;

-- 2. Add 'completed_at' to 'tasks' table for velocity tracking
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
