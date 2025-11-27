import { analyzeArticle } from '../src/lib/gemini';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFullPipeline() {
    const testArticle = {
        title: "トヨタ、2025年に革新的な全固体電池搭載EVを発表　航続距離1000km超を実現",
        content: `
トヨタ自動車は27日、2025年中に全固体電池を搭載した電気自動車（EV）を発表すると発表した。
同社の研究開発責任者によると、新技術により航続距離は1000kmを超え、充電時間も従来の3分の1に短縮される見込み。

業界関係者は「ゲームチェンジャーになる可能性がある」と評価。テスラやBYDなどの競合他社も同様の技術開発を進めているが、
トヨタの発表が最も早いとみられている。日本政府もEV普及促進のため補助金制度を拡大する方針。

株式市場では発表を受けてトヨタ株が5%上昇。アナリストは「技術革新による競争力強化が評価された」と分析している。
    `
    };

    console.log('Testing full analysis pipeline...\n');
    console.log('Title:', testArticle.title);
    console.log('\nAnalyzing...\n');

    try {
        const analysis = await analyzeArticle(testArticle.title, testArticle.content);

        console.log('✅ Analysis successful!\n');
        console.log('Summary:', analysis.summary);
        console.log('\nImportance Score:', analysis.importance_score, '/100');
        console.log('Sentiment:', analysis.sentiment);
        console.log('Tags:', JSON.stringify(analysis.tags, null, 2));
        console.log('Entities:', JSON.stringify(analysis.entities, null, 2));
        console.log('Embedding dimensions:', analysis.embedding.length);

        // Save to database
        console.log('\nSaving to database...');

        const { error } = await supabase.from('articles').insert({
            source_id: 1, // Assuming source ID 1 exists
            title: testArticle.title,
            url: 'https://example.com/test-' + Date.now(),
            content: testArticle.content,
            summary: analysis.summary,
            published_at: new Date().toISOString(),
            importance_score: analysis.importance_score,
            entities: analysis.entities,
            sentiment: analysis.sentiment,
            tags: analysis.tags,
            embedding: analysis.embedding
        });

        if (error) {
            console.error('❌ Database error:', error);
        } else {
            console.log('✅ Saved to database successfully!');
        }

    } catch (error) {
        console.error('❌ Analysis failed:', error);
    }
}

testFullPipeline();
