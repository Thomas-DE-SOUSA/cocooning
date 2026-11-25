import { useCallback, useState } from 'react';
import type { MessageFeedEntry } from '../view-models/message-feed.view-model';

// R6: the sheet keeps its entry while it slides down; only the author's entries open it.
export function useWithdrawSheet() {
    const [entry, setEntry] = useState<MessageFeedEntry | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const open = useCallback((next: MessageFeedEntry) => {
        if (!next.isOwner) return;
        setEntry(next);
        setIsOpen(true);
    }, []);
    const close = useCallback(() => setIsOpen(false), []);
    return { entry, isOpen, open, close };
}
