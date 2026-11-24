import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import {
    CalendarEventMoment,
    type CalendarEventMomentSnapshot,
} from './calendar-event-moment.vo';

const ONE_DAY: CalendarEventMomentSnapshot = {
    startsOn: '2026-12-05',
    endsOn: null,
    startsAt: null,
    endsAt: null,
};

describe('Feature: the moment of a calendar event (R5)', () => {
    describe('Scenario: a moment that keeps the rules', () => {
        it.each([
            ['a whole day', {}],
            ['a start hour alone', { startsAt: '20:00' }],
            ['a start and an end hour', { startsAt: '00:00', endsAt: '23:59' }],
            ['several whole days', { endsOn: '2026-12-06' }],
            [
                'several days, the end hour before the start hour',
                { endsOn: '2026-12-06', startsAt: '20:00', endsAt: '10:00' },
            ],
        ])('keeps %s', (_label, change) => {
            const moment = { ...ONE_DAY, ...change };
            expect(CalendarEventMoment.create(moment).toSnapshot()).toEqual(
                moment,
            );
        });
    });

    describe('Scenario: a moment that breaks a rule', () => {
        it.each([
            ['a first day that is not a day', { startsOn: '05/12/2026' }],
            ['a first day that does not exist', { startsOn: '2026-02-29' }],
            ['a last day that is not a day', { endsOn: '2026-12-32' }],
            ['a last day equal to the first', { endsOn: '2026-12-05' }],
            ['a last day before the first', { endsOn: '2026-12-04' }],
            ['a start hour that is not an hour', { startsAt: '24:00' }],
            ['a start hour without minutes', { startsAt: '8h' }],
            [
                'an end hour that is not an hour',
                { startsAt: '08:00', endsAt: '08:60' },
            ],
            ['an end hour without a start hour', { endsAt: '10:00' }],
            [
                'an end hour equal to the start hour',
                { startsAt: '10:00', endsAt: '10:00' },
            ],
            [
                'an end hour before the start hour',
                { startsAt: '10:00', endsAt: '09:59' },
            ],
        ])('refuses %s', (_label, change) => {
            expect(() =>
                CalendarEventMoment.create({ ...ONE_DAY, ...change }),
            ).toThrow(
                expect.objectContaining({
                    code: AgendaExceptionCodeEnum.CALENDAR_EVENT_MOMENT_INVALID,
                }),
            );
        });
    });
});
