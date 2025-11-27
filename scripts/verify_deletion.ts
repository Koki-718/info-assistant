import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDeletion() {
    // 1. Create a test topic
    const { data: topic, error: createError } = await supabase
        .from('topics')
        .insert({ keyword: 'Delete Me Test' })
        .select()
        .single();

    if (createError) {
        console.error('Failed to create test topic:', createError);
        return;
    }
    console.log('Test topic created:', topic.id);

    // 2. Call the DELETE API
    const res = await fetch(`http://localhost:3002/api/topics/${topic.id}`, {
        method: 'DELETE',
    });

    if (res.ok) {
        console.log('DELETE API succeeded');
    } else {
        console.error('DELETE API failed:', await res.text());
    }

    // 3. Verify it's gone from DB
    const { data: check } = await supabase
        .from('topics')
        .select('id')
        .eq('id', topic.id)
        .single();

    if (!check) {
        console.log('Verification successful: Topic is gone from DB');
    } else {
        console.error('Verification failed: Topic still exists in DB');
    }
}

verifyDeletion();
