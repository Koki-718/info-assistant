import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role Key to bypass RLS for administrative deletion
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
        }

        // Manual Cascade Delete
        // 1. Get sources for this topic
        const { data: sources } = await supabase
            .from('sources')
            .select('id')
            .eq('topic_id', id);

        if (sources && sources.length > 0) {
            const sourceIds = sources.map(s => s.id);

            // 2. Delete articles for these sources
            await supabase
                .from('articles')
                .delete()
                .in('source_id', sourceIds);

            // 3. Delete sources
            await supabase
                .from('sources')
                .delete()
                .eq('topic_id', id);
        }

        // 4. Delete topic
        const { error } = await supabase
            .from('topics')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete Error:', error);
            return NextResponse.json({ error: 'Failed to delete topic', details: error }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
