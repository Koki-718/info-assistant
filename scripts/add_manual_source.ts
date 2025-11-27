import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addSource() {
    // Get the '生成AI' topic
    const { data: topic } = await supabase.from('topics').select('id').eq('keyword', '生成AI').single();

    if (!topic) {
        console.log('Topic not found');
        return;
    }

    // Insert a known good RSS feed
    const { error } = await supabase.from('sources').insert({
        topic_id: topic.id,
        url: 'https://wired.jp/rss/index.xml',
        name: 'WIRED.jp',
        type: 'rss',
        reliability_score: 100
    });

    if (error) console.error('Error adding source:', error);
    else console.log('Source added successfully');
}

addSource();
