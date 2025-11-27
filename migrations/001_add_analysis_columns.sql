-- Migration: Add AI analysis columns to articles table
-- Run this in Supabase SQL Editor

-- Add importance_score column (0-100)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS importance_score INTEGER DEFAULT 50 CHECK (importance_score >= 0 AND importance_score <= 100);

-- Add entities column (JSONB array for people, orgs, technologies)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS entities JSONB DEFAULT '[]'::jsonb;

-- Add sentiment column
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative'));

-- Add tags column (JSONB array for categories)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- Add embedding column for vector search (using pgvector extension)
-- Note: You may need to enable pgvector extension first:
-- CREATE EXTENSION IF NOT EXISTS vector;
-- Gemini embedding-001 produces 3072 dimensions
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS embedding vector(3072);

-- Create index on importance_score for fast filtering
CREATE INDEX IF NOT EXISTS idx_articles_importance ON articles(importance_score DESC);

-- Create index on entities for fast lookups (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_articles_entities ON articles USING GIN (entities);

-- Create index on tags
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN (tags);

-- Note: pgvector indexes support max 2000 dimensions
-- gemini-embedding-001 produces 3072 dimensions, so we skip indexing
-- For small datasets, sequential scan is acceptable for similarity search
-- CREATE INDEX IF NOT EXISTS idx_articles_embedding ON articles USING hnsw (embedding vector_cosine_ops);

-- Comment to describe the changes
COMMENT ON COLUMN articles.importance_score IS 'AI-generated importance score (0-100), higher = more important';
COMMENT ON COLUMN articles.entities IS 'Extracted entities: [{"type": "person", "name": "Elon Musk"}, ...]';
COMMENT ON COLUMN articles.sentiment IS 'Overall sentiment of the article';
COMMENT ON COLUMN articles.tags IS 'AI-generated category tags';
COMMENT ON COLUMN articles.embedding IS 'Vector embedding for similarity search (768 dimensions)';
