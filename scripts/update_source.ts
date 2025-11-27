import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSource() {
    // Update the WIRED.jp source to the correct URL
    const { error } = await supabase
        .from('sources')
        .update({ url: 'https://wired.jp/feed/' })
        .eq('name', 'WIRED.jp');

    if (error) console.error('Error updating source:', error);
    else console.log('Source updated successfully');
}

updateSource();
