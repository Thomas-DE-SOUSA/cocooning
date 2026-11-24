import { useCallback, useState } from 'react';
import type { AgendaDayItem } from '../view-models/agenda-screen.view-model';
import {
    type CalendarEventDrawerTarget,
    CalendarEventDrawerModeEnum,
} from '../view-models/calendar-event-drawer.view-model';

// The target stays while the sheet slides down; each opening starts a new form (the container keys it by `opening`).
export function useCalendarEventDrawer() {
    const [target, setTarget] = useState<CalendarEventDrawerTarget | null>(
        null,
    );
    const [isOpen, setIsOpen] = useState(false);
    const [opening, setOpening] = useState(0);
    const open = useCallback((next: CalendarEventDrawerTarget) => {
        setTarget(next);
        setIsOpen(true);
        setOpening((count) => count + 1);
    }, []);
    return {
        target,
        isOpen,
        opening,
        openCreation: (day: string) =>
            open({ mode: CalendarEventDrawerModeEnum.CREATE, day }),
        openEdition: (item: AgendaDayItem) =>
            open({ mode: CalendarEventDrawerModeEnum.EDIT, item }),
        close: useCallback(() => setIsOpen(false), []),
    };
}
