import { NextResponse } from 'next/server';

/**
 * トピックまたは情報源追加後に3分待機してから情報収集を実行
 */
export async function POST(request: Request) {
    try {
        const { topicId } = await request.json();

        if (!topicId) {
            return NextResponse.json({ error: 'Topic ID required' }, { status: 400 });
        }

        // 3分後に情報収集を実行するために、非同期でタスクをスケジュール
        // 注: Vercelでは長時間実行はできないため、実際の実装では
        // Vercel Edge Config や Redis などを使用して遅延実行を管理する必要があります

        // シンプルな実装: 即座にバックグラウンドで実行
        setTimeout(async () => {
            try {
                // 内部的に cron/update を呼び出し
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                await fetch(`${baseUrl}/api/cron/update?topicId=${topicId}`, {
                    method: 'GET',
                    headers: {
                        'x-cron-secret': process.env.CRON_SECRET || '',
                    },
                });
            } catch (error) {
                console.error('Delayed update failed:', error);
            }
        }, 3 * 60 * 1000); // 3分

        return NextResponse.json({
            success: true,
            message: '3分後に情報収集が開始されます',
        });
    } catch (error) {
        console.error('Trigger Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
