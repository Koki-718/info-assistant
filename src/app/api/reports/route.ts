import { NextResponse } from 'next/server';
import { generateMarkdownReport, generateHTMLReport } from '@/lib/reportGenerator';

export async function POST(request: Request) {
    try {
        const { type, format } = await request.json();

        if (!type || !['daily', 'weekly'].includes(type)) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        if (!format || !['markdown', 'html'].includes(format)) {
            return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
        }

        let content: string;
        if (format === 'markdown') {
            content = await generateMarkdownReport(type);
        } else {
            content = await generateHTMLReport(type);
        }

        return NextResponse.json({ content, format });
    } catch (error) {
        console.error('Report Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
