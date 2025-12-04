'use client';

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

type ReportType = 'daily' | 'weekly';
type ReportFormat = 'markdown' | 'html';

export const ReportGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateReport = async (type: ReportType, format: ReportFormat) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, format }),
            });

            if (!response.ok) {
                throw new Error('レポート生成に失敗しました');
            }

            const { content } = await response.json();

            // ダウンロード
            const blob = new Blob([content], {
                type: format === 'markdown' ? 'text/markdown' : 'text/html',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report_${type}_${new Date().toISOString().split('T')[0]}.${format === 'markdown' ? 'md' : 'html'
                }`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                    <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">レポート生成</h3>
                    <p className="text-sm text-slate-400">自動サマリーをダウンロード</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Daily Report */}
                <div className="border border-slate-700/50 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-white">日次レポート</h4>
                    <p className="text-sm text-slate-400">過去24時間の記事サマリー</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => generateReport('daily', 'markdown')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            <span className="text-sm">Markdown</span>
                        </button>
                        <button
                            onClick={() => generateReport('daily', 'html')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            <span className="text-sm">HTML</span>
                        </button>
                    </div>
                </div>

                {/* Weekly Report */}
                <div className="border border-slate-700/50 rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold text-white">週次レポート</h4>
                    <p className="text-sm text-slate-400">過去7日間の記事サマリー</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => generateReport('weekly', 'markdown')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            <span className="text-sm">Markdown</span>
                        </button>
                        <button
                            onClick={() => generateReport('weekly', 'html')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            <span className="text-sm">HTML</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
