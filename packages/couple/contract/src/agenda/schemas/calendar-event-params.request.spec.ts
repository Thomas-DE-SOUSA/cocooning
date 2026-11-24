import { CalendarEventParamsRequestSchema } from './calendar-event-params.request';

describe('Feature: the calendar event named in a route', () => {
    it('accepts a UUID', () => {
        const calendarEventId = '01936b2e-7c4a-7000-8000-0000000000a1';
        expect(
            CalendarEventParamsRequestSchema.parse({ calendarEventId }),
        ).toEqual({ calendarEventId });
    });

    it.each([['not-a-uuid'], ['']])('rejects %p', (calendarEventId) => {
        expect(
            CalendarEventParamsRequestSchema.safeParse({ calendarEventId })
                .success,
        ).toBe(false);
    });
});
