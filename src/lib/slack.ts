import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type Article = {
    title: string;
    url: string;
    summary: string;
    importance_score: number;
    tags: string[];
    entities: Array<{ name: string; type: string }>;
    source?: { name: string };
};

export async function sendSlackNotification(article: Article) {
    try {
        // 1. Get settings
        const { data: settingsData, error } = await supabase
            .from('settings')
            .select('value')
            .eq('id', 'notification_settings')
            .single();

        if (error || !settingsData) {
            console.log('No notification settings found');
            return;
        }

        const settings = settingsData.value;
        const webhookUrl = settings.slack_webhook_url;
        const minImportance = settings.min_importance || 80;
        const keywords = settings.keywords || [];

        if (!webhookUrl) {
            console.log('No Slack webhook URL configured');
            return;
        }

        // 2. Check conditions
        let shouldNotify = false;
        let reason = '';

        // Check importance
        if (article.importance_score >= minImportance) {
            shouldNotify = true;
            reason = `重要度高 (${article.importance_score})`;
        }

        // Check keywords (tags or entities)
        if (!shouldNotify && keywords.length > 0) {
            const articleText = [
                ...article.tags,
                ...article.entities.map(e => e.name)
            ].join(' ').toLowerCase();

            for (const keyword of keywords) {
                if (articleText.includes(keyword.toLowerCase())) {
                    shouldNotify = true;
                    reason = `キーワード一致: ${keyword}`;
                    break;
                }
            }
        }

        if (!shouldNotify) {
            return;
        }

        // 3. Send notification
        const payload = {
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `🚨 ${reason}: ${article.title}`,
                        emoji: true
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*<${article.url}|元記事を読む>* | *${article.source?.name || 'Unknown Source'}*\n${article.summary}`
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `🔥 重要度: ${article.importance_score} | 🏷️ ${article.tags.join(', ')}`
                        }
                    ]
                }
            ]
        };

        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            console.error('Failed to send Slack notification:', await res.text());
        } else {
            console.log(`Slack notification sent for: ${article.title}`);
        }

    } catch (error) {
        console.error('Error in sendSlackNotification:', error);
    }
}
