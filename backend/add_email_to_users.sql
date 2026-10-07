-- ============================================================================
-- Supabase SQL Migration: Add Email Column to Users Table
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
