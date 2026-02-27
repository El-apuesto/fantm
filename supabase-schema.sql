-- fantm.ink Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- EXTENSIONS (Supabase has uuid-ossp enabled by default)
-- ============================================

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories table
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  title TEXT,
  story_type TEXT NOT NULL CHECK (story_type IN ('novella', 'novel', 'memoir', 'autobiography')),
  package_type TEXT NOT NULL CHECK (package_type IN ('normal', 'premium')),
  
  -- Story configuration
  brief TEXT NOT NULL,
  genre TEXT,
  characters JSONB,
  themes JSONB,
  tone TEXT,
  writing_style TEXT,
  setting TEXT,
  recurring_sentiments TEXT,
  events JSONB,
  locations JSONB,
  target_word_count INTEGER DEFAULT 20000,
  
  -- Author info (for premium)
  author_info JSONB,
  
  -- Content and progress
  content JSONB,
  progress JSONB DEFAULT '{"stage": "draft", "percent": 0}'::jsonb,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_payment', 'generating', 'completed', 'error')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  
  -- Generation tracking
  regeneration_count INTEGER DEFAULT 0,
  
  -- URLs
  pdf_url TEXT,
  epub_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Error tracking
  error TEXT
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  
  -- Payment details
  payment_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  
  -- Story info
  story_type TEXT,
  package_type TEXT,
  bundle_type TEXT,
  
  -- Receipt
  receipt_url TEXT,
  
  -- Refund info
  refund_id TEXT,
  refunded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-saves table (for draft recovery)
CREATE TABLE autosaves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(story_id, user_id)
);

-- Genre categories table
CREATE TABLE genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT CHECK (category IN ('fiction', 'non-fiction', 'memoir', 'all')),
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);

-- Stories
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_story_type ON stories(story_type);
CREATE INDEX idx_stories_package_type ON stories(package_type);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX idx_stories_user_status ON stories(user_id, status);

-- Payments
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_story_id ON payments(story_id);
CREATE INDEX idx_payments_payment_id ON payments(payment_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Auto-saves
CREATE INDEX idx_autosaves_story_id ON autosaves(story_id);
CREATE INDEX idx_autosaves_user_id ON autosaves(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE autosaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Stories: Users can only access their own stories
CREATE POLICY "Users can view own stories" 
  ON stories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create stories" 
  ON stories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" 
  ON stories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" 
  ON stories FOR DELETE 
  USING (auth.uid() = user_id);

-- Payments: Users can only access their own payments
CREATE POLICY "Users can view own payments" 
  ON payments FOR SELECT 
  USING (auth.uid() = user_id);

-- Auto-saves: Users can only access their own auto-saves
CREATE POLICY "Users can view own autosaves" 
  ON autosaves FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create autosaves" 
  ON autosaves FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own autosaves" 
  ON autosaves FOR UPDATE 
  USING (auth.uid() = user_id);

-- Genres: Public read, authenticated insert for custom genres
CREATE POLICY "Anyone can view genres" 
  ON genres FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create custom genres" 
  ON genres FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND is_custom = TRUE);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at 
  BEFORE UPDATE ON stories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default genres
INSERT INTO genres (name, description, category) VALUES
  ('Fantasy', 'Magical worlds, mythical creatures, and epic quests', 'fiction'),
  ('Science Fiction', 'Future technology, space exploration, and alternate realities', 'fiction'),
  ('Mystery', 'Puzzles, detectives, and uncovering secrets', 'fiction'),
  ('Thriller', 'Suspense, tension, and high stakes', 'fiction'),
  ('Romance', 'Love stories and relationships', 'fiction'),
  ('Horror', 'Fear, dread, and the supernatural', 'fiction'),
  ('Literary Fiction', 'Character-driven stories with artistic merit', 'fiction'),
  ('Historical Fiction', 'Stories set in the past', 'fiction'),
  ('Adventure', 'Exciting journeys and daring exploits', 'fiction'),
  ('Dystopian', 'Dark futures and oppressive societies', 'fiction'),
  ('Contemporary', 'Modern-day stories reflecting current times', 'fiction'),
  ('Young Adult', 'Stories for teen readers', 'fiction'),
  ('Crime', 'Criminals, law enforcement, and justice', 'fiction'),
  ('Action', 'Fast-paced excitement and physical conflict', 'fiction'),
  ('Comedy', 'Humor and lighthearted entertainment', 'fiction'),
  ('Drama', 'Emotional stories and interpersonal conflicts', 'fiction'),
  ('Biography', 'Life stories of real people', 'non-fiction'),
  ('History', 'Accounts of past events', 'non-fiction'),
  ('Self-Help', 'Personal improvement and advice', 'non-fiction'),
  ('Business', 'Entrepreneurship, leadership, and commerce', 'non-fiction'),
  ('Travel', 'Journeys and explorations', 'non-fiction'),
  ('Memoir', 'Personal life stories and reflections', 'memoir'),
  ('Autobiography', 'Complete life story written by the subject', 'memoir'),
  ('Personal Essay', 'Introspective personal narratives', 'memoir');

-- ============================================
-- STORAGE SETUP
-- ============================================

-- Note: Create these buckets via Supabase Dashboard:
-- 1. fantmink (public) - for avatars, author images, story illustrations
-- 2. fantmink-private (private) - for generated PDFs and EPUBs

-- RLS policies for storage:
-- - Users can read/write their own avatar in avatars/{user_id}/
-- - Users can read/write their own author images in authors/{user_id}/
-- - Users can read their own generated books in books/{user_id}/
