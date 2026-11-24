import type { CalendarEventResponse } from '@cocooning/couple-contract/agenda';
import { I18N_CONFIG } from '@/i18n/config';

const TITLE_ORDER = new Intl.Collator(I18N_CONFIG.defaultLocale);

type OrderedEvent = Pick<CalendarEventResponse, 'title'> & {
    readonly startsAt: string | null;
};

// All-day first, then by start hour (HH:MM keeps the clock order as a string, decision 0047), then by title.
export const compareCalendarEvents = (
    left: OrderedEvent,
    right: OrderedEvent,
): number => {
    if (left.startsAt !== right.startsAt) {
        if (left.startsAt === null) return -1;
        if (right.startsAt === null) return 1;
        return left.startsAt < right.startsAt ? -1 : 1;
    }
    return TITLE_ORDER.compare(left.title, right.title);
};

// An event covers every day from startsOn to endsOn, both included.
export const isOnDay = (event: CalendarEventResponse, day: string): boolean =>
    event.startsOn <= day && day <= (event.endsOn ?? event.startsOn);
