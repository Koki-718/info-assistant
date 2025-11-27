import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTopic() {
    // Get the topic '高市政権'
    const { data: topic } = await supabase.from('topics').select('id, keyword').eq('keyword', '高市政権').single();

    if (!topic) {
        console.log('Topic not found');
        return;
    }

    // Check if it has sources
    const { data: sources } = await supabase.from('sources').select('id').eq('topic_id', topic.id);

    if (!sources || sources.length === 0) {
        console.log('Adding fallback source for:', topic.keyword);
        const googleNewsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(topic.keyword)}&hl=ja&gl=JP&ceid=JP:ja`;

        await supabase.from('sources').insert({
            topic_id: topic.id,
            url: googleNewsUrl,
            name: 'Google News',
            type: 'rss',
            reliability_score: 90
        });
        console.log('Fallback source added.');
    } else {
        console.log('Topic already has sources.');
    }
}

fixTopic();
