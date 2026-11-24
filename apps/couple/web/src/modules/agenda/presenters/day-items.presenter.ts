import type { CalendarEventResponse } from '@cocooning/couple-contract/agenda';
import { CalendarEventVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import {
    type AgendaDayItem,
    type EventSpan,
    EventSpanKindEnum,
} from '../view-models/agenda-screen.view-model';
import { presentAuthorColor } from './author-color.presenter';
import {
    compareCalendarEvents,
    isOnDay,
} from './calendar-event-order.presenter';
import { presentShortDay } from './day-label.presenter';

function presentSpan(
    event: CalendarEventResponse,
    day: string,
): EventSpan | null {
    if (event.endsOn === null) return null;
    if (day === event.startsOn) {
        return {
            kind: EventSpanKindEnum.UNTIL,
            day: presentShortDay(event.endsOn, day),
        };
    }
    return {
        kind: EventSpanKindEnum.SINCE,
        day: presentShortDay(event.startsOn, day),
    };
}

// The hours belong to the first day; the following days of a multi-day event last all day.
function toDayItem(
    event: CalendarEventResponse,
    day: string,
    creatorId: string | null,
): AgendaDayItem {
    const isFirstDay = day === event.startsOn;
    return {
        calendarEventId: event.calendarEventId,
        title: event.title,
        description: event.description,
        startsAt: isFirstDay ? event.startsAt : null,
        endsAt: isFirstDay && event.endsOn === null ? event.endsAt : null,
        span: presentSpan(event, day),
        moment: {
            startsOn: event.startsOn,
            endsOn: event.endsOn,
            startsAt: event.startsAt,
            endsAt: event.endsAt,
        },
        isOwner: event.isOwner,
        isPrivate: event.visibility === CalendarEventVisibilityEnum.PRIVATE,
        color: presentAuthorColor(event, creatorId),
    };
}

export function presentDayItems(
    events: readonly CalendarEventResponse[],
    day: string,
    creatorId: string | null,
): AgendaDayItem[] {
    return events
        .filter((event) => isOnDay(event, day))
        .map((event) => toDayItem(event, day, creatorId))
        .sort(compareCalendarEvents);
}
