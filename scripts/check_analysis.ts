import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAnalysisData() {
    console.log('Checking recent articles with analysis data...\n');

    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, importance_score, entities, sentiment, tags, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (!articles || articles.length === 0) {
        console.log('No articles found.');
        return;
    }

    console.log(`Found ${articles.length} recent articles:\n`);

    articles.forEach((article, idx) => {
        console.log(`${idx + 1}. ${article.title}`);
        console.log(`   重要度: ${article.importance_score}/100`);
        console.log(`   感情: ${article.sentiment || 'N/A'}`);
        console.log(`   タグ: ${article.tags ? JSON.stringify(article.tags) : 'N/A'}`);
        console.log(`   エンティティ: ${article.entities ? JSON.stringify(article.entities).substring(0, 100) : 'N/A'}`);
        console.log(`   作成日時: ${article.created_at}`);
        console.log('');
    });
}

checkAnalysisData();
