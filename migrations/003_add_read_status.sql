-- Migration: Add read status tracking
-- Run this in Supabase SQL Editor

-- Create read_status table
-- For MVP, we'll use a simple session-based approach without user authentication
-- In production, add user_id foreign key when auth is implemented
CREATE TABLE IF NOT EXISTS article_read_status (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- session_id TEXT, -- For future: session-based tracking without auth
  -- user_id UUID, -- For future: when auth is added
  UNIQUE(article_id) -- For MVP: globally track if article has been read
);

-- Create index for fast filtering
CREATE INDEX IF NOT EXISTS idx_read_status_article ON article_read_status(article_id);
CREATE INDEX IF NOT EXISTS idx_read_status_read_at ON article_read_status(read_at DESC);

-- Add comment
COMMENT ON TABLE article_read_status IS 'Tracks which articles have been marked as read';
