import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { keyword } = await request.json();

        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        // 1. Save Topic
        const { data: topic, error: topicError } = await supabase
            .from('topics')
            .insert({ keyword })
            .select()
            .single();

        if (topicError) {
            console.error('Topic Error:', topicError);
            return NextResponse.json({ error: 'Failed to save topic' }, { status: 500 });
        }

        // 2. AI Agent: Discover Sources
        // In a real app, we would search Google/Bing here.
        // For this prototype, we ask Gemini to suggest RSS feeds or URLs.
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
      User wants to track: "${keyword}".
      Suggest 3 reliable RSS feeds or website URLs to track this topic.
      Return ONLY a JSON array of objects with "url", "name", and "type" (rss or website).
      Example: [{"url": "https://example.com/feed", "name": "Example Tech", "type": "rss"}]
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Clean up markdown code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const sources = JSON.parse(jsonStr);

            // 3. Save Sources
            const sourcesToInsert = sources.map((s: any) => ({
                topic_id: topic.id,
                url: s.url,
                name: s.name,
                type: s.type,
                reliability_score: 80
            }));

            await supabase.from('sources').insert(sourcesToInsert);

        } catch (aiError) {
            console.error('AI Error:', aiError);
            // Non-blocking error, we still return success for the topic
        }

        return NextResponse.json({ success: true, topic });

    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
