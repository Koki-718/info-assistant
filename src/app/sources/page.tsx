'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Topic = {
    id: number;
    keyword: string;
};

type Source = {
    id: number;
    topic_id: number;
    name: string;
    url: string;
    type: string;
};

export default function SourcesPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: topicsData } = await supabase.from('topics').select('*').order('created_at', { ascending: false });
            setTopics(topicsData || []);

            if (topicsData && topicsData.length > 0) {
                setSelectedTopicId(topicsData[0].id);
            }

            const { data: sourcesData } = await supabase.from('sources').select('*');
            setSources(sourcesData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTopicId || !newSourceUrl) return;

        setIsAdding(true);
        try {
            const res = await fetch('/api/sources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topicId: selectedTopicId,
                    url: newSourceUrl,
                    type: newSourceUrl.includes('rss') || newSourceUrl.includes('feed') ? 'rss' : 'website'
                }),
            });

            if (res.ok) {
                const { source } = await res.json();
                setSources([...sources, source]);
                setNewSourceUrl('');
                alert('情報源を追加しました！');
            } else {
                alert('追加に失敗しました。');
            }
        } catch (error) {
            console.error('Error adding source:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteSource = async (id: number) => {
        if (!confirm('この情報源を削除しますか？')) return;

        try {
            const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSources(sources.filter(s => s.id !== id));
            } else {
                alert('削除に失敗しました。');
            }
        } catch (error) {
            console.error('Error deleting source:', error);
        }
    };

    const filteredSources = sources.filter(s => s.topic_id === selectedTopicId);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">情報源の管理</h1>
                <p className="text-slate-400">各トピックの収集元をカスタマイズして、情報の偏りを防ぎましょう。</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Topic List */}
                <div className="md:col-span-1 space-y-2">
                    <h2 className="text-lg font-semibold text-white mb-4">トピック</h2>
                    {topics.map(topic => (
                        <button
                            key={topic.id}
                            onClick={() => setSelectedTopicId(topic.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition ${selectedTopicId === topic.id
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-[#1e293b] text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            {topic.keyword}
                        </button>
                    ))}
                </div>

                {/* Source List & Add Form */}
                <div className="md:col-span-3">
                    <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4">新しい情報源を追加</h2>
                        <form onSubmit={handleAddSource} className="flex gap-4">
                            <input
                                type="url"
                                value={newSourceUrl}
                                onChange={(e) => setNewSourceUrl(e.target.value)}
                                placeholder="URLを入力 (例: https://example.com/feed)"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isAdding || !selectedTopicId}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                追加
                            </button>
                        </form>
                    </div>

                    <div className="space-y-4">
                        {filteredSources.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 bg-[#1e293b] rounded-2xl border border-slate-700/50">
                                このトピックには情報源が登録されていません。
                            </div>
                        ) : (
                            filteredSources.map(source => (
                                <div key={source.id} className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 flex items-center justify-between group hover:border-indigo-500/30 transition">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${source.type === 'rss' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                            {source.type === 'rss' ? 'RSS' : 'WEB'}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">{source.name}</h3>
                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1">
                                                {source.url} <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSource(source.id)}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                                        title="削除"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
