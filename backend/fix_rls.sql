-- =========================================================
-- Fix for: "new row violates row-level security policy for table 'users'"
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =========================================================

-- Option A: Disable RLS on all project tables (Recommended)
-- Since authentication is handled entirely by your Express JWT server,
-- disabling RLS allows the server to manage the data without restriction.

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE github_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE repo_analysis DISABLE ROW LEVEL SECURITY;
ALTER TABLE leetcode_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_targets DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_targets DISABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history DISABLE ROW LEVEL SECURITY;

-- Option B (Alternative): If you prefer to keep RLS enabled,
-- uncomment the lines below to permit all operations:

-- CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all on github_cache" ON github_cache FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all on repo_analysis" ON repo_analysis FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all on leetcode_cache" ON leetcode_cache FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all on weekly_targets" ON weekly_targets FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all on monthly_targets" ON monthly_targets FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all on roadmap_progress" ON roadmap_progress FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all on chat_history" ON chat_history FOR ALL USING (true) WITH CHECK (true);
