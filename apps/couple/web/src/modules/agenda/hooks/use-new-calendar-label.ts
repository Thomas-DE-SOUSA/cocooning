import { useCallback, useState } from 'react';
import type { CalendarLabelItem } from '../view-models/calendar-label.view-model';

// The "Nouvelle étiquette" sheet above the event sheet. The page is not read again while the event is being filled
// (a new reading could start another form): the created labels are kept here, and the new one is picked on the event.
export function useNewCalendarLabel(
    onCreated: (label: CalendarLabelItem) => void,
) {
    const [isOpen, setIsOpen] = useState(false);
    const [opening, setOpening] = useState(0);
    const [created, setCreated] = useState<readonly CalendarLabelItem[]>([]);
    const close = useCallback(() => setIsOpen(false), []);
    const onDone = useCallback(
        (_command: unknown, label: CalendarLabelItem | null) => {
            setIsOpen(false);
            if (label === null) return;
            setCreated((labels) => [...labels, label]);
            onCreated(label);
        },
        [onCreated],
    );
    return {
        isOpen,
        opening,
        created,
        open: () => {
            setIsOpen(true);
            setOpening((count) => count + 1);
        },
        close,
        onDone,
    };
}
