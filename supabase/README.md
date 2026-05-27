# Supabase Configuration & Migrations

This directory contains SQL migrations for your Supabase database.

## Applying the RLS Migration

To secure your database, you **must** apply the Row Level Security (RLS) policies.

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your `Life OS` project
3. Navigate to the **SQL Editor** (the `< / >` icon on the left sidebar)
4. Create a new query
5. Copy and paste the entire contents of `migrations/001_enable_rls.sql` into the query editor
6. Click **Run**

## Verifying RLS

1. Navigate to the **Table Editor**
2. For each table (tasks, habits, books, etc.), verify that you see a lock icon or a badge that says **RLS enabled** next to the table name.

## Why is this important?
Without RLS, anyone with your `NEXT_PUBLIC_SUPABASE_ANON_KEY` can read, modify, or delete any data in your database. This migration ensures that users can only access their own data.
