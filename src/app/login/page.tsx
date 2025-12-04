'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signUpWithEmail } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'login') {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
            // ハードリフレッシュでcookieを確実に反映
            window.location.href = '/';
        } catch (err: any) {
            setError(err.message || 'エラーが発生しました');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b0e14] via-[#1a1d29] to-[#0b0e14] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">📊</h1>
                    <h2 className="text-2xl font-bold text-white">インテリジェンス・アシスタント</h2>
                    <p className="text-slate-400 mt-2">情報を知識に変える</p>
                </div>

                {/* Auth Card */}
                <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2 rounded-lg transition ${mode === 'login'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            ログイン
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-2 rounded-lg transition ${mode === 'signup'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            新規登録
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                メールアドレス
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                パスワード
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
                                placeholder="••••••••"
                            />
                            {mode === 'signup' && (
                                <p className="mt-2 text-xs text-slate-400">6文字以上</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                        >
                            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウント作成'}
                        </button>
                    </form>

                    {mode === 'signup' && (
                        <p className="mt-6 text-xs text-slate-400 text-center">
                            アカウント作成後、確認メールが送信されます。<br />
                            メールのリンクをクリックして登録を完了してください。
                        </p>
                    )}
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                    © 2024 Intelligence Assistant
                </p>
            </div>
        </div>
    );
}
