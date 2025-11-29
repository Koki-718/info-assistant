-- Migration: Add is_active column to topics table
-- This allows users to temporarily disable topics without deleting them

ALTER TABLE topics
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for filtering active topics
CREATE INDEX IF NOT EXISTS idx_topics_is_active ON topics(is_active);

COMMENT ON COLUMN topics.is_active IS 'Whether this topic is currently active for data collection';
