'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import {
    requestNotificationPermission,
    getNotificationPermission,
    getNotificationSettings,
    saveNotificationSettings,
} from '@/lib/notifications';

export const NotificationSettings = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [settings, setSettings] = useState({
        enabled: false,
        minImportance: 80,
    });

    useEffect(() => {
        setPermission(getNotificationPermission());
        setSettings(getNotificationSettings());
    }, []);

    const handleEnableNotifications = async () => {
        const perm = await requestNotificationPermission();
        setPermission(perm);

        if (perm === 'granted') {
            const newSettings = { ...settings, enabled: true };
            setSettings(newSettings);
            saveNotificationSettings(newSettings);
        }
    };

    const handleDisableNotifications = () => {
        const newSettings = { ...settings, enabled: false };
        setSettings(newSettings);
        saveNotificationSettings(newSettings);
    };

    const handleMinImportanceChange = (value: number) => {
        const newSettings = { ...settings, minImportance: value };
        setSettings(newSettings);
        saveNotificationSettings(newSettings);
    };

    return (
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                    <Bell className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">通知設定</h3>
                    <p className="text-sm text-slate-400">デスクトップ通知の管理</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Permission Status */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-white">通知権限</p>
                        <p className="text-xs text-slate-400">
                            {permission === 'granted' && '✅ 許可済み'}
                            {permission === 'denied' && '❌ ブロック中'}
                            {permission === 'default' && '⏸️ 未設定'}
                        </p>
                    </div>
                    {permission !== 'granted' && (
                        <button
                            onClick={handleEnableNotifications}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition text-sm font-medium"
                        >
                            権限を許可
                        </button>
                    )}
                </div>

                {permission === 'granted' && (
                    <>
                        {/* Enable/Disable Toggle */}
                        <div className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-white">通知を有効化</p>
                                <p className="text-xs text-slate-400">重要記事の新着通知</p>
                            </div>
                            <button
                                onClick={settings.enabled ? handleDisableNotifications : handleEnableNotifications}
                                className={`relative w-12 h-6 rounded-full transition ${settings.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.enabled ? 'translate-x-6' : ''
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Min Importance Slider */}
                        {settings.enabled && (
                            <div className="p-4 border border-slate-700/50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-white">最小重要度</p>
                                    <span className="text-sm text-indigo-400 font-bold">{settings.minImportance}</span>
                                </div>
                                <p className="text-xs text-slate-400 mb-4">
                                    この値以上の重要度スコアの記事のみ通知されます
                                </p>
                                <input
                                    type="range"
                                    min="50"
                                    max="100"
                                    step="10"
                                    value={settings.minImportance}
                                    onChange={(e) => handleMinImportanceChange(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-2">
                                    <span>50</span>
                                    <span>60</span>
                                    <span>70</span>
                                    <span>80</span>
                                    <span>90</span>
                                    <span>100</span>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {permission === 'denied' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                        <p className="text-sm text-red-400">
                            通知がブロックされています。ブラウザの設定から通知を許可してください。
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
