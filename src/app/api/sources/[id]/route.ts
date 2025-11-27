import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role Key to bypass RLS
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
            return NextResponse.json({ error: 'Source ID is required' }, { status: 400 });
        }

        // Delete related articles first (Manual Cascade)
        await supabase.from('articles').delete().eq('source_id', id);

        // Delete source
        const { error } = await supabase.from('sources').delete().eq('id', id);

        if (error) {
            return NextResponse.json({ error: 'Failed to delete source', details: error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
