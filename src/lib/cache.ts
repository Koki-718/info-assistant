/**
 * クライアント側キャッシュ管理
 */

const CACHE_PREFIX = 'info-assistant-cache:';
const CACHE_DURATION = 5 * 60 * 1000; // 5分

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

/**
 * キャッシュにデータを保存
 */
export function setCacheData<T>(key: string, data: T): void {
    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
        console.warn('Failed to cache data:', error);
    }
}

/**
 * キャッシュからデータを取得
 */
export function getCacheData<T>(key: string, maxAge: number = CACHE_DURATION): T | null {
    try {
        const cached = localStorage.getItem(CACHE_PREFIX + key);
        if (!cached) return null;

        const entry: CacheEntry<T> = JSON.parse(cached);
        const age = Date.now() - entry.timestamp;

        if (age > maxAge) {
            // 期限切れ
            deleteCacheData(key);
            return null;
        }

        return entry.data;
    } catch (error) {
        console.warn('Failed to get cached data:', error);
        return null;
    }
}

/**
 * キャッシュを削除
 */
export function deleteCacheData(key: string): void {
    try {
        localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
        console.warn('Failed to delete cached data:', error);
    }
}

/**
 * 全キャッシュをクリア
 */
export function clearAllCache(): void {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
            if (key.startsWith(CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.warn('Failed to clear cache:', error);
    }
}

/**
 * キャッシュサイズを取得（バイト）
 */
export function getCacheSize(): number {
    try {
        let size = 0;
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
            if (key.startsWith(CACHE_PREFIX)) {
                const item = localStorage.getItem(key);
                if (item) {
                    size += item.length * 2; // UTF-16 = 2 bytes per character
                }
            }
        });
        return size;
    } catch (error) {
        console.warn('Failed to calculate cache size:', error);
        return 0;
    }
}

/**
 * キャッシュサイズを人間が読みやすい形式に変換
 */
export function formatCacheSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
