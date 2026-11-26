import type {
    CalendarEventQueryRequest,
    CalendarEventResponse,
} from '@cocooning/couple-contract/agenda';
import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import type {
    DayMark,
    DayMarks,
} from '../view-models/agenda-screen.view-model';
import { compareCalendarEvents } from './calendar-event-order.presenter';
import type { CalendarLabelIndex } from './calendar-labels.presenter';
import { presentEventLabel } from './event-tint.presenter';
import { presentRangeDays } from './month-grid.presenter';

export const MAX_MARKS_PER_DAY = 3;

function daysCovered(
    event: CalendarEventResponse,
    range: CalendarEventQueryRequest,
): string[] {
    const first = event.startsOn > range.from ? event.startsOn : range.from;
    const lastOfEvent = event.endsOn ?? event.startsOn;
    const last = lastOfEvent < range.to ? lastOfEvent : range.to;
    return presentRangeDays({ from: first, to: last });
}

// R13: a dot in the colour of the label. R7: the API sends the other's private events to nobody; a private one of
// mine is a hollow ring.
export function presentDayMarks(
    events: readonly CalendarEventResponse[],
    labels: CalendarLabelIndex,
    range: CalendarEventQueryRequest,
): DayMarks {
    const marks: Record<string, DayMark[]> = {};
    for (const event of [...events].sort(compareCalendarEvents)) {
        const mark: DayMark = {
            calendarEventId: event.calendarEventId,
            tint: presentEventLabel(event.labelId, labels).tint,
            isPrivate: event.visibility === CalendarEventVisibilityEnum.PRIVATE,
        };
        for (const day of daysCovered(event, range)) {
            const dayMarks = (marks[day] ??= []);
            if (dayMarks.length < MAX_MARKS_PER_DAY) dayMarks.push(mark);
        }
    }
    return marks;
}
