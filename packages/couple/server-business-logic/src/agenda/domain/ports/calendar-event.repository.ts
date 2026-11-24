import type { CalendarEvent } from '../models/calendar-event.aggregate';

// Visibility is filtered by the query, never in memory (core-backend.md rule 12): another partner's private event is not found (R7).
export abstract class CalendarEventRepository {
    abstract save(calendarEvent: CalendarEvent): Promise<void>;
    abstract findVisibleById(
        coupleId: string,
        userId: string,
        calendarEventId: string,
    ): Promise<CalendarEvent | null>;
    // The events that touch a day from `from` to `to` included, in day order: startsOn, then all day before startsAt.
    abstract findVisibleOverlapping(
        coupleId: string,
        userId: string,
        from: string,
        to: string,
    ): Promise<ReadonlyArray<CalendarEvent>>;
}
