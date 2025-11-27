'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TopicInput() {
    const [keyword, setKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword }),
            });
            if (res.ok) {
                setKeyword('');
                // Trigger refresh or notification
                alert('トピックを追加しました！AIが情報収集を開始します。');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="mb-12">
            <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto md:mx-0">
                <div className={cn(
                    "flex items-center bg-[#1e293b] border border-slate-700/50 rounded-2xl p-2 shadow-lg transition-all",
                    "focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10"
                )}>
                    <div className="p-3 text-indigo-400">
                        <Search className="w-6 h-6" />
                    </div>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 bg-transparent border-none text-white px-2 py-2 focus:outline-none text-lg placeholder-slate-500"
                        placeholder="興味のあるトピックを入力 (例: 生成AI, 宇宙開発...)"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition shadow-glow disabled:opacity-50"
                    >
                        {isLoading ? '処理中...' : '追跡開始'}
                    </button>
                </div>
            </form>
            <div className="mt-4 flex gap-3 text-sm max-w-2xl mx-auto md:mx-0">
                <span className="text-slate-500">おすすめ:</span>
                <button onClick={() => setKeyword('最新AIモデル')} className="px-3 py-1 rounded-lg bg-slate-800/50 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition">最新AIモデル</button>
                <button onClick={() => setKeyword('暗号資産規制')} className="px-3 py-1 rounded-lg bg-slate-800/50 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition">暗号資産規制</button>
            </div>
        </section>
    );
}
