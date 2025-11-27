-- Fix embedding column dimension mismatch
-- Run this in Supabase SQL Editor if you already ran the previous migration

-- Drop the existing column with wrong dimension
ALTER TABLE articles DROP COLUMN IF EXISTS embedding;

-- Re-add with correct dimension (3072 for gemini-embedding-001)
ALTER TABLE articles 
ADD COLUMN embedding vector(3072);

-- Note: pgvector indexes (both ivfflat and hnsw) support max 2000 dimensions
-- gemini-embedding-001 produces 3072 dimensions, so we cannot create an index
-- For small datasets (<10k articles), sequential scan is acceptable
-- CREATE INDEX IF NOT EXISTS idx_articles_embedding ON articles USING hnsw (embedding vector_cosine_ops);

-- Update comment
COMMENT ON COLUMN articles.embedding IS 'Vector embedding for similarity search (3072 dimensions, gemini-embedding-001)';
