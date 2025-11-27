'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Database, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
    { href: '/sources', label: '情報源', icon: Database },
    { href: '/reports', label: 'レポート', icon: FileText },
    { href: '/settings', label: '設定', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col p-6 hidden md:flex h-screen sticky top-0">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <span className="font-bold text-lg tracking-tight text-white">Nexus AI</span>
            </div>

            <nav className="space-y-1 flex-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm",
                                isActive
                                    ? "bg-[#1e293b] text-indigo-400"
                                    : "text-slate-400 hover:bg-[#1e293b] hover:text-white"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-800">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-white">User</div>
                        <div className="text-xs text-slate-400">Pro Plan</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
