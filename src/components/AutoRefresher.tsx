'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export function AutoRefresher() {
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    useEffect(() => {
        const checkAndTrigger = async () => {
            const now = new Date();
            setLastChecked(now);

            // 1. Regular Schedule: 8:00, 12:00, 18:00
            const schedules = [8, 12, 18];

            // Get latest article time to see when we last updated
            const { data: latestArticle } = await supabase
                .from('articles')
                .select('created_at')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            const lastUpdate = latestArticle ? new Date(latestArticle.created_at) : new Date(0);

            let shouldUpdate = false;
            let reason = '';

            // Check Regular Schedule
            for (const hour of schedules) {
                const scheduleTime = new Date();
                scheduleTime.setHours(hour, 0, 0, 0);

                // If we passed the schedule time AND the last update was BEFORE this schedule time
                if (now > scheduleTime && lastUpdate < scheduleTime) {
                    shouldUpdate = true;
                    reason = `Scheduled time ${hour}:00 passed`;
                    break;
                }
            }

            // 2. New Topic Check (3 minutes after creation)
            if (!shouldUpdate) {
                // Find topics created between 3 and 4 minutes ago
                const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);
                const fourMinutesAgo = new Date(now.getTime() - 4 * 60 * 1000);

                const { data: newTopics } = await supabase
                    .from('topics')
                    .select('id, created_at')
                    .gt('created_at', fourMinutesAgo.toISOString())
                    .lt('created_at', threeMinutesAgo.toISOString());

                if (newTopics && newTopics.length > 0) {
                    // Check if we already fetched for this topic (simple check: is last update AFTER topic creation?)
                    // Actually, simpler: just trigger if we find a topic in this "3-4 min ago" window.
                    // The cron job handles idempotency (won't re-fetch same articles).
                    shouldUpdate = true;
                    reason = `New topic detected (${newTopics.length} topics)`;
                }
            }

            if (shouldUpdate) {
                try {
                    console.log(`AutoRefresher: Executing update... Reason: ${reason}`);
                    await fetch('/api/cron/update');
                    console.log('AutoRefresher: Update completed.');
                } catch (error) {
                    console.error('AutoRefresher: Update failed', error);
                }
            }
        };

        // Check immediately on mount
        checkAndTrigger();

        // Check every minute
        const intervalId = setInterval(checkAndTrigger, 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    return null;
}

