'use client';

import { useEffect, useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Topic = {
    id: number;
    keyword: string;
    created_at: string;
};

export default function SettingsPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const { data, error } = await supabase
                .from('topics')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTopics(data || []);
        } catch (error) {
            console.error('Error fetching topics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('このトピックを削除してもよろしいですか？関連する記事も削除される可能性があります。')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/topics/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setTopics(topics.filter(t => t.id !== id));
            } else {
                alert('削除に失敗しました。');
            }
        } catch (error) {
            console.error('Error deleting topic:', error);
            alert('エラーが発生しました。');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">設定</h1>
                <p className="text-slate-400">登録済みトピックの管理</p>
            </header>

            <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700/50">
                    <h2 className="text-xl font-semibold text-white">登録トピック一覧</h2>
                </div>

                {isLoading ? (
                    <div className="p-10 flex justify-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                ) : topics.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                        登録されたトピックはありません。
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700/50">
                        {topics.map((topic) => (
                            <div key={topic.id} className="p-6 flex items-center justify-between hover:bg-slate-800/50 transition">
                                <div>
                                    <h3 className="text-lg font-medium text-white">{topic.keyword}</h3>
                                    <p className="text-sm text-slate-500">ID: {topic.id} • 登録日: {new Date(topic.created_at).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(topic.id)}
                                    disabled={deletingId === topic.id}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition disabled:opacity-50"
                                    title="削除"
                                >
                                    {deletingId === topic.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
