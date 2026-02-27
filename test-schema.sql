-- Test schema for Supabase
-- Run this first to test extension

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Test table
CREATE TABLE test_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
