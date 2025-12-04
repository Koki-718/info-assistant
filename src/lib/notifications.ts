/**
 * Web Notifications APIのラッパー
 */

export type NotificationPriority = 'high' | 'normal' | 'low';

export interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    priority?: NotificationPriority;
    url?: string;
}

/**
 * 通知権限をリクエスト
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('このブラウザは通知をサポートしていません');
        return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
}

/**
 * 通知権限の状態を取得
 */
export function getNotificationPermission(): NotificationPermission {
    if (!('Notification' in window)) {
        return 'denied';
    }
    return Notification.permission;
}

/**
 * デスクトップ通知を表示
 */
export async function showNotification(options: NotificationOptions): Promise<void> {
    const permission = getNotificationPermission();

    if (permission !== 'granted') {
        console.warn('通知権限が許可されていません');
        return;
    }

    const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon.png',
        tag: options.tag,
        requireInteraction: options.priority === 'high',
    });

    if (options.url) {
        notification.onclick = () => {
            window.open(options.url, '_blank');
            notification.close();
        };
    }

    // 自動的に閉じる（高優先度以外）
    if (options.priority !== 'high') {
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
}

/**
 * 重要記事の通知
 */
export async function notifyImportantArticle(article: {
    title: string;
    summary: string;
    importance_score: number;
    url: string;
}): Promise<void> {
    await showNotification({
        title: `🔥 重要記事: ${article.title}`,
        body: article.summary.substring(0, 100) + '...',
        tag: `article-${article.url}`,
        priority: article.importance_score >= 90 ? 'high' : 'normal',
        url: article.url,
    });
}

/**
 * LocalStorageから通知設定を取得
 */
export function getNotificationSettings(): {
    enabled: boolean;
    minImportance: number;
} {
    const settings = localStorage.getItem('notificationSettings');
    if (settings) {
        return JSON.parse(settings);
    }
    return {
        enabled: false,
        minImportance: 80,
    };
}

/**
 * LocalStorageに通知設定を保存
 */
export function saveNotificationSettings(settings: {
    enabled: boolean;
    minImportance: number;
}): void {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
}
