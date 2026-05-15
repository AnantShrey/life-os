-- Google Calendar Integration Tables

-- 1. Table for tracking calendar connections
CREATE TABLE IF NOT EXISTS calendar_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  google_account_email TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS for calendar_connections
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to allow re-running this script
DROP POLICY IF EXISTS "Users manage their own calendar connection" ON calendar_connections;

-- Create policy
CREATE POLICY "Users manage their own calendar connection"
  ON calendar_connections FOR ALL USING (auth.uid() = user_id);

-- 2. Table for tracking synced events (Tasks and Habits)
CREATE TABLE IF NOT EXISTS synced_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  source_type TEXT CHECK (source_type IN ('task', 'habit')) NOT NULL,
  source_id UUID NOT NULL,
  google_event_id TEXT NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for synced_events
ALTER TABLE synced_events ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to allow re-running this script
DROP POLICY IF EXISTS "Users manage their own synced events" ON synced_events;

-- Create policy
CREATE POLICY "Users manage their own synced events"
  ON synced_events FOR ALL USING (auth.uid() = user_id);
