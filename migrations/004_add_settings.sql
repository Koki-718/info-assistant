-- Create settings table for storing app configuration
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO settings (id, value)
VALUES (
    'notification_settings',
    '{
        "slack_webhook_url": "",
        "min_importance": 80,
        "keywords": []
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;
