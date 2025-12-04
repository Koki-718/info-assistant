'use client';

import { useEffect, useRef, ReactNode } from 'react';

type Props = {
    onLoadMore: () => void;
    hasMore: boolean;
    loading: boolean;
    threshold?: number;
    children: ReactNode;
};

export const InfiniteScroll = ({
    onLoadMore,
    hasMore,
    loading,
    threshold = 300,
    children,
}: Props) => {
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            {
                root: null,
                rootMargin: `${threshold}px`,
                threshold: 0,
            }
        );

        observer.observe(sentinel);

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
        };
    }, [hasMore, loading, onLoadMore, threshold]);

    return (
        <>
            {children}
            <div ref={sentinelRef} className="h-4" />
            {loading && (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                </div>
            )}
        </>
    );
};
