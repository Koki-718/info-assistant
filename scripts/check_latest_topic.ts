import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestTopic() {
    // Get latest topic
    const { data: topics } = await supabase
        .from('topics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (!topics || topics.length === 0) {
        console.log('No topics found.');
        return;
    }

    const topic = topics[0];
    console.log(`Latest Topic: ${topic.keyword} (ID: ${topic.id})`);

    // Get sources for this topic
    const { data: sources } = await supabase
        .from('sources')
        .select('*')
        .eq('topic_id', topic.id);

    if (!sources || sources.length === 0) {
        console.log('No sources found for this topic.');
    } else {
        console.log(`Found ${sources.length} sources:`);
        sources.forEach(s => console.log(`- ${s.name}: ${s.url} (${s.type})`));
    }
}

checkLatestTopic();
