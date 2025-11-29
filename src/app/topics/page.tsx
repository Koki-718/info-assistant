'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react';

type Topic = {
    id: number;
    keyword: string;
    is_active: boolean;
    created_at: string;
};

type Source = {
    id: number;
    topic_id: number;
    name: string;
    url: string;
    type: string;
};

export default function TopicsPage() {
    const searchParams = useSearchParams();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
    const [newTopicKeyword, setNewTopicKeyword] = useState('');
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingTopic, setIsAddingTopic] = useState(false);
    const [isAddingSource, setIsAddingSource] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [topicsRes, sourcesRes] = await Promise.all([
                fetch('/api/topics'),
                fetch('/api/sources')
            ]);

            if (topicsRes.ok) {
                const data = await topicsRes.json();
                setTopics(data.topics || []);

                // Check if there's a topic ID in the URL
                const topicIdParam = searchParams.get('id');
                if (topicIdParam) {
                    const topicId = parseInt(topicIdParam);
                    if (data.topics && data.topics.find((t: Topic) => t.id === topicId)) {
                        setSelectedTopicId(topicId);
                    } else if (data.topics && data.topics.length > 0) {
                        setSelectedTopicId(data.topics[0].id);
                    }
                } else if (data.topics && data.topics.length > 0) {
                    setSelectedTopicId(data.topics[0].id);
                }
            }

            if (sourcesRes.ok) {
                const data = await sourcesRes.json();
                setSources(data.sources || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopicKeyword.trim()) return;

        setIsAddingTopic(true);
        try {
            const res = await fetch('/api/topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: newTopicKeyword }),
            });

            if (res.ok) {
                const { topic } = await res.json();
                setTopics([topic, ...topics]);
                setNewTopicKeyword('');
                setSelectedTopicId(topic.id);
            } else {
                alert('追加に失敗しました。');
            }
        } catch (error) {
            console.error('Error adding topic:', error);
        } finally {
            setIsAddingTopic(false);
        }
    };

    const handleToggleTopic = async (id: number, currentState: boolean) => {
        try {
            const res = await fetch(`/api/topics/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !currentState }),
            });

            if (res.ok) {
                setTopics(topics.map(t => t.id === id ? { ...t, is_active: !currentState } : t));
            } else {
                alert('更新に失敗しました。');
            }
        } catch (error) {
            console.error('Error toggling topic:', error);
        }
    };

    const handleDeleteTopic = async (id: number) => {
        if (!confirm('このトピックを削除しますか？関連する情報源も削除されます。')) return;

        try {
            const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTopics(topics.filter(t => t.id !== id));
                setSources(sources.filter(s => s.topic_id !== id));
                if (selectedTopicId === id) {
                    setSelectedTopicId(topics[0]?.id || null);
                }
            } else {
                alert('削除に失敗しました。');
            }
        } catch (error) {
            console.error('Error deleting topic:', error);
        }
    };

    const handleAddSource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTopicId || !newSourceUrl) return;

        setIsAddingSource(true);
        try {
            const res = await fetch('/api/sources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topicId: selectedTopicId,
                    url: newSourceUrl,
                }),
            });

            if (res.ok) {
                const { source } = await res.json();
                setSources([...sources, source]);
                setNewSourceUrl('');
            } else {
                alert('追加に失敗しました。');
            }
        } catch (error) {
            console.error('Error adding source:', error);
        } finally {
            setIsAddingSource(false);
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

    const selectedTopic = topics.find(t => t.id === selectedTopicId);
    const filteredSources = sources.filter(s => s.topic_id === selectedTopicId);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">トピック管理</h1>
                <p className="text-slate-400">関心のあるトピックと情報源を設定して、AIが自動でニュースを収集します。</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Topic List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold text-white mb-4">トピック一覧</h2>

                    {/* Add Topic Form */}
                    <form onSubmit={handleAddTopic} className="space-y-2 mb-6">
                        <input
                            type="text"
                            value={newTopicKeyword}
                            onChange={(e) => setNewTopicKeyword(e.target.value)}
                            placeholder="新しいトピック"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={isAddingTopic}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isAddingTopic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            追加
                        </button>
                    </form>

                    {/* Topic List */}
                    <div className="space-y-2">
                        {topics.map(topic => (
                            <div key={topic.id} className="group">
                                <button
                                    onClick={() => setSelectedTopicId(topic.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${selectedTopicId === topic.id
                                        ? 'bg-teal-600 text-white'
                                        : topic.is_active
                                            ? 'bg-[#1e293b] text-slate-300 hover:bg-slate-800'
                                            : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <span className={!topic.is_active ? 'line-through' : ''}>{topic.keyword}</span>
                                    {!topic.is_active && <span className="text-xs opacity-60">無効</span>}
                                </button>
                            </div>
                        ))}
                        {topics.length === 0 && (
                            <div className="text-center text-slate-600 text-sm py-4">
                                トピックがありません
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Topic Details & Sources */}
                <div className="lg:col-span-3">
                    {selectedTopic ? (
                        <div className="space-y-6">
                            {/* Topic Header */}
                            <div className="bg-[#1e293b] border-2 border-teal-600 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-white">{selectedTopic.keyword}</h2>
                                    <div className="flex items-center gap-3">
                                        {/* Toggle Switch */}
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <span className="text-sm text-slate-400">
                                                {selectedTopic.is_active ? '情報収集中' : '停止中'}
                                            </span>
                                            <div
                                                onClick={() => handleToggleTopic(selectedTopic.id, selectedTopic.is_active)}
                                                className={`relative w-12 h-6 rounded-full transition ${selectedTopic.is_active ? 'bg-teal-600' : 'bg-slate-700'
                                                    }`}
                                            >
                                                <div
                                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${selectedTopic.is_active ? 'translate-x-6' : ''
                                                        }`}
                                                />
                                            </div>
                                        </label>
                                        <button
                                            onClick={() => handleDeleteTopic(selectedTopic.id)}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                            title="削除"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500">
                                    作成日: {new Date(selectedTopic.created_at).toLocaleDateString('ja-JP')}
                                </p>
                            </div>

                            {/* Sources Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">情報源</h3>

                                {/* Add Source Form */}
                                <form onSubmit={handleAddSource} className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 mb-4">
                                    <div className="flex gap-3">
                                        <input
                                            type="url"
                                            value={newSourceUrl}
                                            onChange={(e) => setNewSourceUrl(e.target.value)}
                                            placeholder="URLを入力 (例: https://example.com/feed)"
                                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={isAddingSource}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isAddingSource ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                            追加
                                        </button>
                                    </div>
                                </form>

                                {/* Source List */}
                                <div className="space-y-3">
                                    {filteredSources.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500 bg-[#1e293b] rounded-xl border border-slate-700/50">
                                            このトピックには情報源が登録されていません。
                                        </div>
                                    ) : (
                                        filteredSources.map(source => (
                                            <div key={source.id} className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 flex items-center justify-between group hover:border-indigo-500/30 transition">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${source.type === 'rss' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                                                        }`}>
                                                        {source.type === 'rss' ? 'RSS' : 'WEB'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-white">{source.name || 'No Name'}</h4>
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
                    ) : (
                        <div className="text-center py-20 text-slate-500 bg-[#1e293b] rounded-xl border border-slate-700/50">
                            左側からトピックを選択してください
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
