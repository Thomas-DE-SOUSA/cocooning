import { CalendarEventQueryRequestSchema } from './calendar-event-query.request';

describe('Feature: the days of a calendar event list', () => {
    it('accepts two days', () => {
        const query = { from: '2026-12-01', to: '2026-12-31' };
        expect(CalendarEventQueryRequestSchema.parse(query)).toEqual(query);
    });

    it.each([
        ['a missing day', { from: '2026-12-01' }],
        ['a day that does not exist', { from: '2026-02-30', to: '2026-03-01' }],
        ['an instant', { from: '2026-12-01T00:00:00Z', to: '2026-12-31' }],
    ])('rejects %s', (_label, query) => {
        expect(CalendarEventQueryRequestSchema.safeParse(query).success).toBe(
            false,
        );
    });
});
