import type {
    CalendarEventQueryRequest,
    CalendarEventResponse,
} from '@cocooning/couple-contract/agenda';
import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import type {
    DayMark,
    DayMarks,
} from '../view-models/agenda-screen.view-model';
import { presentAuthorColor } from './author-color.presenter';
import { addDays } from './calendar-day.presenter';
import { compareCalendarEvents } from './calendar-event-order.presenter';

export const MAX_MARKS_PER_DAY = 3;

function daysCovered(
    event: CalendarEventResponse,
    range: CalendarEventQueryRequest,
): string[] {
    const first = event.startsOn > range.from ? event.startsOn : range.from;
    const lastOfEvent = event.endsOn ?? event.startsOn;
    const last = lastOfEvent < range.to ? lastOfEvent : range.to;
    const days: string[] = [];
    for (let day = first; day <= last; day = addDays(day, 1)) days.push(day);
    return days;
}

// R7: the API sends the other's private events to nobody; a private one of mine is a hollow ring.
export function presentDayMarks(
    events: readonly CalendarEventResponse[],
    creatorId: string | null,
    range: CalendarEventQueryRequest,
): DayMarks {
    const marks: Record<string, DayMark[]> = {};
    for (const event of [...events].sort(compareCalendarEvents)) {
        const mark: DayMark = {
            calendarEventId: event.calendarEventId,
            color: presentAuthorColor(event, creatorId),
            isPrivate: event.visibility === CalendarEventVisibilityEnum.PRIVATE,
        };
        for (const day of daysCovered(event, range)) {
            const dayMarks = (marks[day] ??= []);
            if (dayMarks.length < MAX_MARKS_PER_DAY) dayMarks.push(mark);
        }
    }
    return marks;
}
