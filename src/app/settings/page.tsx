'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [settings, setSettings] = useState({
        slack_webhook_url: '',
        min_importance: 80,
        keywords: [] as string[]
    });

    const [keywordInput, setKeywordInput] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (!res.ok) throw new Error('Failed to fetch settings');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: '設定の読み込みに失敗しました' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!res.ok) throw new Error('Failed to save settings');

            setMessage({ type: 'success', text: '設定を保存しました' });

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: '設定の保存に失敗しました' });
        } finally {
            setSaving(false);
        }
    };

    const addKeyword = () => {
        if (!keywordInput.trim()) return;
        if (settings.keywords.includes(keywordInput.trim())) return;

        setSettings(prev => ({
            ...prev,
            keywords: [...prev.keywords, keywordInput.trim()]
        }));
        setKeywordInput('');
    };

    const removeKeyword = (keyword: string) => {
        setSettings(prev => ({
            ...prev,
            keywords: prev.keywords.filter(k => k !== keyword)
        }));
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                設定
            </h1>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-slate-800 rounded w-full"></div>
                    <div className="h-10 bg-slate-800 rounded w-full"></div>
                    <div className="h-10 bg-slate-800 rounded w-full"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Slack Notification Settings */}
                    <section className="bg-[#1a1d24] border border-slate-800 rounded-xl p-6 shadow-lg">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#4A154B]" fill="currentColor" viewBox="0 0 24 24"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.52v-6.315zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.52v2.522h-2.52zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.522-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.522-2.522v-2.522h2.522zM15.165 17.688a2.527 2.527 0 0 1-2.522-2.522 2.527 2.527 0 0 1 2.522-2.522h6.312A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.312z" /></svg>
                            Slack通知設定
                        </h2>

                        <div className="space-y-6">
                            {/* Webhook URL */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Webhook URL
                                </label>
                                <input
                                    type="text"
                                    value={settings.slack_webhook_url}
                                    onChange={(e) => setSettings({ ...settings, slack_webhook_url: e.target.value })}
                                    placeholder="https://hooks.slack.com/services/..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    SlackのIncoming Webhook URLを入力してください。
                                </p>
                            </div>

                            {/* Importance Threshold */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    重要度しきい値: <span className="text-indigo-400 font-bold">{settings.min_importance}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.min_importance}
                                    onChange={(e) => setSettings({ ...settings, min_importance: Number(e.target.value) })}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    このスコア以上の記事が通知されます。
                                </p>
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    通知キーワード
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                                        placeholder="例: トヨタ, AI, 決算"
                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition"
                                    />
                                    <button
                                        onClick={addKeyword}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition"
                                    >
                                        追加
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {settings.keywords.map(keyword => (
                                        <span key={keyword} className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                            {keyword}
                                            <button onClick={() => removeKeyword(keyword)} className="hover:text-red-400">
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    {settings.keywords.length === 0 && (
                                        <span className="text-slate-600 text-sm">キーワードが設定されていません</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    タグやエンティティにこれらのキーワードが含まれる場合も通知されます（重要度に関わらず）。
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Save Button */}
                    <div className="flex items-center justify-end gap-4">
                        {message && (
                            <span className={`text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {message.text}
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition shadow-lg shadow-indigo-500/20 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {saving ? '保存中...' : '設定を保存'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
