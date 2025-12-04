-- ユーザー認証機能のためのデータベーススキーマ更新

-- 1. user_id列を追加（既存データはNULLを許可、後で更新）
ALTER TABLE topics ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE article_read_status ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE article_feedback ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. RLSを有効化
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_feedback ENABLE ROW LEVEL SECURITY;

-- 3. RLSポリシーを作成

-- Topics
DROP POLICY IF EXISTS "Users can view own topics" ON topics;
CREATE POLICY "Users can view own topics" ON topics
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own topics" ON topics;
CREATE POLICY "Users can insert own topics" ON topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own topics" ON topics;
CREATE POLICY "Users can update own topics" ON topics
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own topics" ON topics;
CREATE POLICY "Users can delete own topics" ON topics
    FOR DELETE USING (auth.uid() = user_id);

-- Sources (topics経由でアクセス制御)
DROP POLICY IF EXISTS "Users can view sources for own topics" ON sources;
CREATE POLICY "Users can view sources for own topics" ON sources
    FOR SELECT USING (
        topic_id IN (SELECT id FROM topics WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can insert sources for own topics" ON sources;
CREATE POLICY "Users can insert sources for own topics" ON sources
    FOR INSERT WITH CHECK (
        topic_id IN (SELECT id FROM topics WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update sources for own topics" ON sources;
CREATE POLICY "Users can update sources for own topics" ON sources
    FOR UPDATE USING (
        topic_id IN (SELECT id FROM topics WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can delete sources for own topics" ON sources;
CREATE POLICY "Users can delete sources for own topics" ON sources
    FOR DELETE USING (
        topic_id IN (SELECT id FROM topics WHERE user_id = auth.uid())
    );

-- Articles (sources経由でアクセス制御)
DROP POLICY IF EXISTS "Users can view articles for own topics" ON articles;
CREATE POLICY "Users can view articles for own topics" ON articles
    FOR SELECT USING (
        source_id IN (
            SELECT id FROM sources WHERE topic_id IN (
                SELECT id FROM topics WHERE user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Users can insert articles for own topics" ON articles;
CREATE POLICY "Users can insert articles for own topics" ON articles
    FOR INSERT WITH CHECK (
        source_id IN (
            SELECT id FROM sources WHERE topic_id IN (
                SELECT id FROM topics WHERE user_id = auth.uid()
            )
        )
    );

-- Article Read Status
DROP POLICY IF EXISTS "Users can view own read status" ON article_read_status;
CREATE POLICY "Users can view own read status" ON article_read_status
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own read status" ON article_read_status;
CREATE POLICY "Users can insert own read status" ON article_read_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own read status" ON article_read_status;
CREATE POLICY "Users can delete own read status" ON article_read_status
    FOR DELETE USING (auth.uid() = user_id);

-- Article Feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON article_feedback;
CREATE POLICY "Users can view own feedback" ON article_feedback
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own feedback" ON article_feedback;
CREATE POLICY "Users can insert own feedback" ON article_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own feedback" ON article_feedback;
CREATE POLICY "Users can update own feedback" ON article_feedback
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Supabase Authを有効化
-- これはSupabase DashboardのAuthenticationセクションで手動で有効化する必要があります

-- 5. 既存データの移行（オプション）
-- 開発環境でテストユーザーを作成後、そのuser_idで既存データを更新
-- UPDATE topics SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE article_read_status SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE article_feedback SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
