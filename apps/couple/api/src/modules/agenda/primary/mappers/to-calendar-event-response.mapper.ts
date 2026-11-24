import type {
    CalendarEventListResponse,
    CalendarEventResponse,
} from '@cocooning/couple-contract/agenda';
import type { CalendarEventView } from '@cocooning/couple-server-business-logic/agenda';

// Dates cross the wire as ISO strings (contracts.md rule 4); days and hours already are strings (decision 0047).
export const toCalendarEventResponse = (
    view: CalendarEventView,
): CalendarEventResponse => ({
    ...view,
    updatedAt: view.updatedAt.toISOString(),
});

export const toCalendarEventListResponse = (
    views: ReadonlyArray<CalendarEventView>,
): CalendarEventListResponse => ({
    items: views.map(toCalendarEventResponse),
});
