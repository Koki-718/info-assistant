import { analyzeArticle } from '../src/lib/gemini';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testAnalysis() {
    const sampleTitle = "高市首相、初の党首討論で日中関係や財政規律について論戦";
    const sampleContent = `
高市早苗首相は27日午後、首相就任後初めての党首討論に臨む。
与野党は日中関係や財政規律、経済対策などについて論戦を交わす見通し。
立憲民主党の泉健太代表や日本維新の会の馬場伸幸代表らが質問に立つ予定。
高市首相は「建設的な議論を期待している」とコメントした。
`;

    console.log('Testing AI Analysis...');
    console.log('Title:', sampleTitle);
    console.log('Content length:', sampleContent.length);
    console.log('\nAnalyzing...\n');

    try {
        const result = await analyzeArticle(sampleTitle, sampleContent);
        console.log('Analysis Result:');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error during analysis:', error);
    }
}

testAnalysis();
