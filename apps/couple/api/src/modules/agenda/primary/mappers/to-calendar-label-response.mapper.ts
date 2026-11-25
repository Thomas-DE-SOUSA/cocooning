import type {
    CalendarLabelListResponse,
    CalendarLabelResponse,
} from '@cocooning/couple-contract/agenda';
import type { CalendarLabelView } from '@cocooning/couple-server-business-logic/agenda';

// Dates cross the wire as ISO strings (contracts.md rule 4).
export const toCalendarLabelResponse = (
    view: CalendarLabelView,
): CalendarLabelResponse => ({
    ...view,
    updatedAt: view.updatedAt.toISOString(),
});

export const toCalendarLabelListResponse = (
    views: ReadonlyArray<CalendarLabelView>,
): CalendarLabelListResponse => ({
    items: views.map(toCalendarLabelResponse),
});
