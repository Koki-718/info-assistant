import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> | { id: string } }
) {
    console.log('=== PATCH HANDLER CALLED ===');
    console.log('Environment check:', {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
    });

    try {
        // Handle both Next.js 14 and 15 params format
        const params = await Promise.resolve(context.params);
        const body = await request.json();
        const { is_active } = body;
        const id = parseInt(params.id);

        console.log('PATCH /api/topics/[id]:', { id, is_active, params, body });

        const { data, error } = await supabase
            .from('topics')
            .update({ is_active })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('Update successful:', data);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error updating topic:', error);
        return NextResponse.json({ error: 'Failed to update topic', details: String(error) }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const params = await Promise.resolve(context.params);
        const id = parseInt(params.id);

        // Delete associated sources first
        await supabase.from('sources').delete().eq('topic_id', id);

        // Then delete the topic
        const { error } = await supabase.from('topics').delete().eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting topic:', error);
        return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
    }
}
