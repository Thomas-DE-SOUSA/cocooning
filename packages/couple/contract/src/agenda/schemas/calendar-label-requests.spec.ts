import { CALENDAR_LABEL_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { CalendarLabelParamsRequestSchema } from './calendar-label-params.request';
import { CreateCalendarLabelRequestSchema } from './create-calendar-label.request';
import { EditCalendarLabelRequestSchema } from './edit-calendar-label.request';

const SPORT = { name: 'Sport', color: 'SAGE' };

describe.each([
    ['create', CreateCalendarLabelRequestSchema],
    ['edit', EditCalendarLabelRequestSchema],
])('Feature: the label sent to %s (R12)', (_action, schema) => {
    it('accepts a name without its surrounding spaces and a colour', () => {
        expect(schema.parse({ ...SPORT, name: '  Sport ' })).toEqual(SPORT);
    });

    it('accepts the longest name', () => {
        const name = 'a'.repeat(CALENDAR_LABEL_NAME_MAX_LENGTH);
        expect(schema.safeParse({ ...SPORT, name }).success).toBe(true);
    });

    it.each([
        ['an empty name', { name: '  ' }],
        [
            'a name too long',
            { name: 'a'.repeat(CALENDAR_LABEL_NAME_MAX_LENGTH + 1) },
        ],
        ['a missing name', { name: undefined }],
        ['a colour outside the palette', { color: 'RED' }],
        ['a missing colour', { color: undefined }],
    ])('rejects %s', (_label, change) => {
        expect(schema.safeParse({ ...SPORT, ...change }).success).toBe(false);
    });
});

describe('Feature: the calendar label named in a route', () => {
    it('accepts a UUID', () => {
        const calendarLabelId = '01936b2e-7c4a-7000-8000-0000000000b1';
        expect(
            CalendarLabelParamsRequestSchema.parse({ calendarLabelId }),
        ).toEqual({ calendarLabelId });
    });

    it.each([['not-a-uuid'], ['']])('rejects %p', (calendarLabelId) => {
        expect(
            CalendarLabelParamsRequestSchema.safeParse({ calendarLabelId })
                .success,
        ).toBe(false);
    });
});
