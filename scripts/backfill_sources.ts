import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillSources() {
    // 1. Get all topics
    const { data: topics, error } = await supabase.from('topics').select('id, keyword');

    if (error || !topics) {
        console.error('Error fetching topics:', error);
        return;
    }

    console.log(`Checking ${topics.length} topics...`);

    for (const topic of topics) {
        // 2. Check if topic has sources
        const { count } = await supabase
            .from('sources')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);

        if (count === 0) {
            console.log(`Topic "${topic.keyword}" has 0 sources. Adding fallback...`);

            const googleNewsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(topic.keyword)}&hl=ja&gl=JP&ceid=JP:ja`;

            await supabase.from('sources').insert({
                topic_id: topic.id,
                url: googleNewsUrl,
                name: 'Google News (Auto)',
                type: 'rss',
                reliability_score: 90
            });

            console.log(`Added Google News source for "${topic.keyword}"`);
        }
    }
    console.log('Backfill complete.');
}

backfillSources();
