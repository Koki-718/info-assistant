import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchFeed, fetchWebPage } from '@/lib/fetcher';
import { summarizeText, generateEmbedding } from '@/lib/gemini';

// Allow this to run for up to 5 minutes on Vercel Pro (or default 10s on Hobby, so be careful)
export const maxDuration = 300;

export async function GET(request: Request) {
    // In production, verify a secret token to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 1. Get all active sources
        const { data: sources, error: sourceError } = await supabase
            .from('sources')
            .select('*');

        if (sourceError || !sources) {
            return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
        }

        let processedCount = 0;

        // 2. Process each source
        for (const source of sources) {
            let articles = [];

            if (source.type === 'rss') {
                articles = await fetchFeed(source.url);
            } else {
                // For websites, we might just fetch the main page as one "article" or look for links
                // For this prototype, let's treat the page itself as the content to monitor
                const article = await fetchWebPage(source.url);
                if (article) articles = [article];
            }

            // 3. Process each article
            for (const item of articles) {
                // Check if exists
                const { data: existing } = await supabase
                    .from('articles')
                    .select('id')
                    .eq('url', item.url)
                    .single();

                if (!existing) {
                    // New article found!

                    // Summarize
                    const summary = await summarizeText(item.content);

                    // Generate Embedding
                    const embedding = await generateEmbedding(summary);

                    // Save
                    await supabase.from('articles').insert({
                        source_id: source.id,
                        title: item.title,
                        url: item.url,
                        content: item.content, // Store full content? Maybe truncate if too large
                        summary: summary,
                        published_at: item.publishedAt,
                        embedding: embedding // pgvector
                    });

                    processedCount++;
                }
            }
        }

        return NextResponse.json({ success: true, processed: processedCount });

    } catch (error) {
        console.error('Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
