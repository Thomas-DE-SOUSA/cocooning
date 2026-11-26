import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { CalendarLabelItem } from '../view-models/calendar-label.view-model';

// The label being edited stays while its sheet slides down; after a command the page reads the labels again.
export function useCalendarLabelsCard() {
    const router = useRouter();
    const [label, setLabel] = useState<CalendarLabelItem | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [opening, setOpening] = useState(0);
    const close = useCallback(() => setIsOpen(false), []);
    const closeAndRefresh = useCallback(() => {
        setIsOpen(false);
        router.refresh();
    }, [router]);
    return {
        refresh: useCallback(() => router.refresh(), [router]),
        label,
        isOpen,
        opening,
        open: (next: CalendarLabelItem) => {
            setLabel(next);
            setIsOpen(true);
            setOpening((count) => count + 1);
        },
        close,
        closeAndRefresh,
    };
}
