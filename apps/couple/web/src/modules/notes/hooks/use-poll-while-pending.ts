import { useEffect } from 'react';
import { NOTE_CARD_POLL_INTERVAL_MS } from '../data/note-card-polling';

// R20: while a card is « en recherche », the screen reads its data again; never while the PWA is hidden, whose return
// reads it anyway (decision 0036).
export function usePollWhilePending(
    isPending: boolean,
    refresh: () => void,
): void {
    useEffect(() => {
        if (!isPending) return;
        const timer = setInterval(() => {
            if (document.visibilityState === 'visible') refresh();
        }, NOTE_CARD_POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [isPending, refresh]);
}
