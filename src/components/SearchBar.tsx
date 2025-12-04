'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

type Props = {
    onSearch: (query: string) => void;
    placeholder?: string;
};

export const SearchBar = ({ onSearch, placeholder = '記事を検索...' }: Props) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // デバウンス処理
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    const handleClear = () => {
        setQuery('');
        onSearch('');
        inputRef.current?.focus();
    };

    // ショートカットキー (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative w-full max-w-2xl">
            <div
                className={`flex items-center gap-3 bg-[#1e293b] border ${isFocused ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-slate-700'
                    } rounded-xl px-4 py-3 transition-all`}
            >
                <Search className={`w-5 h-5 ${isFocused ? 'text-indigo-400' : 'text-slate-500'} transition`} />

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none"
                />

                {query && (
                    <button
                        onClick={handleClear}
                        className="p-1 hover:bg-slate-700 rounded-lg transition"
                        title="クリア"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                )}

                <kbd className="hidden sm:block px-2 py-1 text-xs text-slate-500 bg-slate-800 border border-slate-700 rounded">
                    {typeof navigator !== 'undefined' && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? '⌘' : 'Ctrl+'}K
                </kbd>
            </div>
        </div>
    );
};
