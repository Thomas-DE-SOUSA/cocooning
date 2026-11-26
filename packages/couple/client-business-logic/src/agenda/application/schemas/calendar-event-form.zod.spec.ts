import {
    CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH,
    CALENDAR_EVENT_TITLE_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { createCalendarEventFormSchema } from './calendar-event-form.zod';

const schema = createCalendarEventFormSchema((key) => `t:${key}`);
const A_FORM = {
    title: 'Diner chez Lea',
    description: '',
    startsOn: '2026-12-05',
    endsOn: '',
    startsAt: '',
    endsAt: '',
    isPrivate: false,
    audience: 'BOTH',
    labelId: null as string | null,
};
type FormInput = typeof A_FORM;

const issuesOf = (change: Partial<FormInput>) => {
    const result = schema.safeParse({ ...A_FORM, ...change });
    return result.success
        ? []
        : result.error.issues.map(({ path, message }) => [
              path.join('.'),
              message,
          ]);
};

describe('Feature: the event typed in the agenda form (R2, R5, R6, R11, R13)', () => {
    it('trims the texts and turns the empty optional inputs into null', () => {
        expect(
            schema.parse({ ...A_FORM, title: ' Diner ', description: '  ' }),
        ).toEqual({
            title: 'Diner',
            description: null,
            startsOn: '2026-12-05',
            endsOn: null,
            startsAt: null,
            endsAt: null,
            isPrivate: false,
            audience: 'BOTH',
            labelId: null,
        });
    });

    it.each([
        [
            'a trip',
            { endsOn: '2026-12-07', startsAt: '18:00', endsAt: '09:00' },
        ],
        ['an evening', { startsAt: '20:00', endsAt: '23:30' }],
        ['a start hour alone', { startsAt: '20:00' }],
        ['an event of mine kept for me', { isPrivate: true, audience: 'ME' }],
        ['an event for you with a label', { audience: 'YOU', labelId: 'l1' }],
        [
            'the longest texts',
            {
                title: 'a'.repeat(CALENDAR_EVENT_TITLE_MAX_LENGTH),
                description: 'a'.repeat(CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH),
            },
        ],
    ])('accepts %s', (_label, change) => {
        expect(issuesOf(change)).toEqual([]);
    });

    it.each([
        ['an empty title', { title: ' ' }, 'title', 'title.errors.required'],
        [
            'a title too long',
            { title: 'a'.repeat(CALENDAR_EVENT_TITLE_MAX_LENGTH + 1) },
            'title',
            'title.errors.tooLong',
        ],
        [
            'a description too long',
            {
                description: 'a'.repeat(
                    CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH + 1,
                ),
            },
            'description',
            'description.errors.tooLong',
        ],
        [
            'no day',
            { startsOn: '' },
            'startsOn',
            'moment.errors.startsOnRequired',
        ],
        [
            'a day that does not exist',
            { startsOn: '2026-02-30' },
            'startsOn',
            'moment.errors.dayInvalid',
        ],
        [
            'a wrong last day',
            { endsOn: '05/12/2026' },
            'endsOn',
            'moment.errors.dayInvalid',
        ],
        [
            'a wrong hour',
            { startsAt: '24:00' },
            'startsAt',
            'moment.errors.hourInvalid',
        ],
        [
            'a last day on the first',
            { endsOn: '2026-12-05' },
            'endsOn',
            'moment.errors.endsOnNotAfterStartsOn',
        ],
        [
            'an end hour without start hour',
            { endsAt: '22:00' },
            'endsAt',
            'moment.errors.endsAtWithoutStartsAt',
        ],
        [
            'an end hour on the start hour the same day',
            { startsAt: '20:00', endsAt: '20:00' },
            'endsAt',
            'moment.errors.endsAtNotAfterStartsAt',
        ],
        [
            'an event « rien que pour moi » for both',
            { isPrivate: true, audience: 'BOTH' },
            'audience',
            'audience.errors.privateNotForMe',
        ],
        [
            'an event « rien que pour moi » for you',
            { isPrivate: true, audience: 'YOU' },
            'audience',
            'audience.errors.privateNotForMe',
        ],
        [
            'no audience',
            { audience: '' },
            'audience',
            'audience.errors.required',
        ],
    ])(
        'refuses %s with its translated message (decision 0031)',
        (_label, change, path, key) => {
            expect(issuesOf(change)).toEqual([[path, `t:form.${key}`]]);
        },
    );

    it('reports both order mistakes at once', () => {
        expect(
            issuesOf({ endsOn: '2026-12-04', endsAt: '10:00' }).map(
                ([path]) => path,
            ),
        ).toEqual(['endsOn', 'endsAt']);
    });
});
