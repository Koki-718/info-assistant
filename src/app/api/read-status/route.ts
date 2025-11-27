import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { articleId } = await request.json();

        if (!articleId) {
            return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
        }

        // Insert or update read status
        const { error } = await supabase
            .from('article_read_status')
            .upsert({ article_id: articleId, read_at: new Date().toISOString() }, { onConflict: 'article_id' });

        if (error) {
            return NextResponse.json({ error: 'Failed to mark as read', details: error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const articleId = searchParams.get('articleId');

        if (!articleId) {
            return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('article_read_status')
            .delete()
            .eq('article_id', articleId);

        if (error) {
            return NextResponse.json({ error: 'Failed to mark as unread', details: error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
