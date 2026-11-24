import type { CalendarEventVisibility } from '@cocooning/couple-shared-kernel/enums';
import type { CalendarEvent } from '../../domain/models/calendar-event.aggregate';

export type CalendarEventView = {
    readonly calendarEventId: string;
    readonly ownerId: string;
    readonly isOwner: boolean;
    readonly title: string;
    readonly description: string | null;
    readonly startsOn: string;
    readonly endsOn: string | null;
    readonly startsAt: string | null;
    readonly endsAt: string | null;
    readonly visibility: CalendarEventVisibility;
    readonly updatedAt: Date;
};

// isOwner tells the reader whether the visibility actions apply to them (R8); the PWA colours the author by ownerId.
export const toCalendarEventView = (
    calendarEvent: CalendarEvent,
    readerId: string,
): CalendarEventView => {
    const { id, ownerId, ...details } = calendarEvent.toSnapshot();
    return {
        calendarEventId: id,
        ownerId,
        isOwner: ownerId === readerId,
        title: details.title,
        description: details.description,
        startsOn: details.startsOn,
        endsOn: details.endsOn,
        startsAt: details.startsAt,
        endsAt: details.endsAt,
        visibility: details.visibility,
        updatedAt: calendarEvent.updatedAt,
    };
};

export const toCalendarEventViews = (
    calendarEvents: ReadonlyArray<CalendarEvent>,
    readerId: string,
): ReadonlyArray<CalendarEventView> =>
    calendarEvents.map((calendarEvent) =>
        toCalendarEventView(calendarEvent, readerId),
    );
