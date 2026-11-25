import {
    CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH,
    CALENDAR_EVENT_TITLE_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { CreateCalendarEventRequestSchema } from './create-calendar-event.request';
import { EditCalendarEventRequestSchema } from './edit-calendar-event.request';

const LABEL_ID = '01936b2e-7c4a-7000-8000-0000000000b1';
const DINNER = {
    title: 'Dîner chez Paul',
    description: null,
    startsOn: '2026-12-05',
    endsOn: null,
    startsAt: '20:00',
    endsAt: null,
    audience: 'BOTH',
    labelId: null,
    visibility: 'SHARED',
};

describe.each([
    ['create', CreateCalendarEventRequestSchema],
    ['edit', EditCalendarEventRequestSchema],
])('Feature: the details sent to %s a calendar event', (_action, schema) => {
    it('accepts a title and a description without their surrounding spaces', () => {
        expect(
            schema.parse({ ...DINNER, title: ' Dîner ', description: ' Vin ' }),
        ).toMatchObject({ title: 'Dîner', description: 'Vin' });
    });

    it('accepts the longest title and description', () => {
        const body = {
            ...DINNER,
            title: 'a'.repeat(CALENDAR_EVENT_TITLE_MAX_LENGTH),
            description: 'a'.repeat(CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH),
        };
        expect(schema.safeParse(body).success).toBe(true);
    });

    it.each([
        ['an empty title', { title: ' ' }],
        [
            'a title too long',
            { title: 'a'.repeat(CALENDAR_EVENT_TITLE_MAX_LENGTH + 1) },
        ],
        [
            'a description too long',
            {
                description: 'a'.repeat(
                    CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH + 1,
                ),
            },
        ],
        ['a missing description', { description: undefined }],
        ['a first day that does not exist', { startsOn: '2026-02-29' }],
        ['a last day that is not a day', { endsOn: '13/12/2026' }],
        ['a start hour that is not an hour', { startsAt: '24:00' }],
        ['an end hour with seconds', { endsAt: '22:00:00' }],
        ['an unknown audience', { audience: 'FRIENDS' }],
        ['a missing audience', { audience: undefined }],
        ['a label that is not a UUID', { labelId: 'sport' }],
        ['a missing label', { labelId: undefined }],
    ])('rejects %s', (_label, change) => {
        expect(schema.safeParse({ ...DINNER, ...change }).success).toBe(false);
    });

    it.each([['OWNER'], ['PARTNER'], ['BOTH']])(
        'accepts the audience %s (R11)',
        (audience) => {
            expect(schema.safeParse({ ...DINNER, audience }).success).toBe(
                true,
            );
        },
    );
});

describe.each([
    ['create', CreateCalendarEventRequestSchema],
    ['edit', EditCalendarEventRequestSchema],
])(
    'Feature: the label sent to %s a calendar event (R13)',
    (_action, schema) => {
        it('accepts a label', () => {
            expect(
                schema.parse({ ...DINNER, labelId: LABEL_ID }),
            ).toMatchObject({
                labelId: LABEL_ID,
            });
        });

        it('accepts no label', () => {
            expect(schema.parse(DINNER)).toMatchObject({ labelId: null });
        });
    },
);

describe('Feature: the visibility chosen at creation (R3)', () => {
    it.each([['SHARED'], ['PRIVATE']])('accepts %s', (visibility) => {
        expect(
            CreateCalendarEventRequestSchema.safeParse({
                ...DINNER,
                visibility,
            }).success,
        ).toBe(true);
    });

    it.each([['PUBLIC'], [undefined]])('rejects %p', (visibility) => {
        expect(
            CreateCalendarEventRequestSchema.safeParse({
                ...DINNER,
                visibility,
            }).success,
        ).toBe(false);
    });
});
