import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');


export type ReportType = 'daily' | 'weekly';

export type ReportData = {
    period: string;
    totalArticles: number;
    importantArticles: number;
    topTopics: Array<{ name: string; count: number }>;
    summary: string;
    articles: Array<{
        title: string;
        summary: string;
        importance_score: number;
        url: string;
        published_at: string;
    }>;
};

/**
 * レポート用のデータを集計
 */
async function aggregateReportData(type: ReportType): Promise<ReportData> {
    const now = new Date();
    const startDate = new Date();

    if (type === 'daily') {
        startDate.setDate(now.getDate() - 1);
    } else {
        startDate.setDate(now.getDate() - 7);
    }

    // 記事を取得
    const { data: articles } = await supabase
        .from('articles')
        .select('id, title, summary, importance_score, url, published_at, source:sources(topic:topics(keyword))')
        .gte('published_at', startDate.toISOString())
        .order('importance_score', { ascending: false });

    if (!articles) {
        throw new Error('Failed to fetch articles');
    }

    // 統計計算
    const totalArticles = articles.length;
    const importantArticles = articles.filter((a) => a.importance_score && a.importance_score >= 80).length;

    // トピック別集計
    const topicCounts = new Map<string, number>();
    articles.forEach((a: any) => {
        const topicName = a.source?.topic?.keyword;
        if (topicName) {
            topicCounts.set(topicName, (topicCounts.get(topicName) || 0) + 1);
        }
    });

    const topTopics = Array.from(topicCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        period: type === 'daily' ? '過去24時間' : '過去7日間',
        totalArticles,
        importantArticles,
        topTopics,
        summary: '', // AIで生成
        articles: articles.slice(0, 20).map((a: any) => ({
            title: a.title,
            summary: a.summary,
            importance_score: a.importance_score || 50,
            url: a.url,
            published_at: a.published_at,
        })),
    };
}

/**
 * AIでレポートサマリーを生成
 */
async function generateReportSummary(data: ReportData): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
    const topArticles = data.articles.slice(0, 5);

    const prompt = `
以下の情報から、簡潔なレポートサマリーを日本語で作成してください。

期間: ${data.period}
総記事数: ${data.totalArticles}
重要記事数: ${data.importantArticles}

主要トピック:
${data.topTopics.map((t) => `- ${t.name}: ${t.count}件`).join('\n')}

上位記事:
${topArticles.map((a, i) => `${i + 1}. ${a.title} (重要度: ${a.importance_score})`).join('\n')}

要約（200文字程度）:
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Summary Generation Error:', error);
        return 'AIサマリーの生成に失敗しました。';
    }
}

/**
 * Markdownフォーマットでレポートを生成
 */
export async function generateMarkdownReport(type: ReportType): Promise<string> {
    const data = await aggregateReportData(type);
    data.summary = await generateReportSummary(data);

    const md = `# インテリジェンスレポート

**期間**: ${data.period}  
**生成日時**: ${new Date().toLocaleString('ja-JP')}

## サマリー

${data.summary}

## 統計

- **総記事数**: ${data.totalArticles}件
- **重要記事数**: ${data.importantArticles}件

## 主要トピック

${data.topTopics.map((t, i) => `${i + 1}. **${t.name}**: ${t.count}件`).join('\n')}

## 重要記事（上位10件）

${data.articles.slice(0, 10).map((a, i) => `
### ${i + 1}. ${a.title}

**重要度**: ${a.importance_score}/100  
**公開日**: ${new Date(a.published_at).toLocaleDateString('ja-JP')}  
**URL**: ${a.url}

${a.summary}

---
`).join('\n')}

*このレポートは自動生成されました。*
`;

    return md;
}

/**
 * HTMLフォーマットでレポートを生成
 */
export async function generateHTMLReport(type: ReportType): Promise<string> {
    const data = await aggregateReportData(type);
    data.summary = await generateReportSummary(data);

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>インテリジェンスレポート</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
    .content { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { margin: 0; }
    h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .stat { display: inline-block; margin: 10px 20px 10px 0; }
    .article { border-left: 4px solid #667eea; padding-left: 15px; margin: 20px 0; }
    .importance { display: inline-block; padding: 5px 10px; border-radius: 5px; font-weight: bold; }
    .importance-high { background: #fee; color: #c00; }
    .importance-medium { background: #fef; color: #f80; }
    .importance-low { background: #eef; color: #06f; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 インテリジェンスレポート</h1>
    <p><strong>期間:</strong> ${data.period}</p>
    <p><strong>生成日時:</strong> ${new Date().toLocaleString('ja-JP')}</p>
  </div>
  
  <div class="content">
    <h2>サマリー</h2>
    <p>${data.summary}</p>
    
    <h2>統計</h2>
    <div class="stat">📰 総記事数: <strong>${data.totalArticles}件</strong></div>
    <div class="stat">🔥 重要記事数: <strong>${data.importantArticles}件</strong></div>
    
    <h2>主要トピック</h2>
    <ol>
      ${data.topTopics.map((t) => `<li><strong>${t.name}</strong>: ${t.count}件</li>`).join('')}
    </ol>
    
    <h2>重要記事（上位10件）</h2>
    ${data.articles.slice(0, 10).map((a, i) => {
        const importanceClass = a.importance_score >= 80 ? 'importance-high' : a.importance_score >= 60 ? 'importance-medium' : 'importance-low';
        return `
        <div class="article">
          <h3>${i + 1}. ${a.title}</h3>
          <p><span class="importance ${importanceClass}">重要度: ${a.importance_score}/100</span></p>
          <p><strong>公開日:</strong> ${new Date(a.published_at).toLocaleDateString('ja-JP')}</p>
          <p>${a.summary}</p>
          <p><a href="${a.url}" target="_blank">記事を読む →</a></p>
        </div>
      `;
    }).join('')}
    
    <hr>
    <p style="text-align: center; color: #888; font-size: 12px;">このレポートは自動生成されました。</p>
  </div>
</body>
</html>
`;

    return html;
}
