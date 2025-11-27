'use client';

import { useEffect } from 'react';

export function AutoRefresher() {
    useEffect(() => {
        // Function to trigger the update
        const triggerUpdate = async () => {
            try {
                console.log('AutoRefresher: Triggering data update...');
                await fetch('/api/cron/update');
                console.log('AutoRefresher: Update triggered.');
            } catch (error) {
                console.error('AutoRefresher: Update failed', error);
            }
        };

        // Trigger immediately on mount (optional, maybe wait a bit)
        // triggerUpdate(); 

        // Set interval for every 5 minutes (300000 ms)
        const intervalId = setInterval(triggerUpdate, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    return null; // This component renders nothing
}
