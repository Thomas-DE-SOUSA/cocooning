import {
    coupleCalendarDayAt,
    coupleInstantOf,
    MINUTES_PER_DAY,
} from './couple-time';

const NINE_AM = 9 * 60;

describe('Feature: the Paris day and hours of the couple (R7, R8)', () => {
    describe('Scenario: the day of an instant', () => {
        it.each([
            [
                'a winter evening, still the same day',
                '2026-11-24T22:59:59.999Z',
                '2026-11-24',
            ],
            [
                'a winter midnight in Paris',
                '2026-11-24T23:00:00.000Z',
                '2026-11-25',
            ],
            [
                'a summer midnight in Paris',
                '2027-06-30T22:00:00.000Z',
                '2027-07-01',
            ],
            [
                'the last minute of a summer day',
                '2027-06-30T21:59:00.000Z',
                '2027-06-30',
            ],
        ])('reads %s', (_label, instant, day) => {
            expect(coupleCalendarDayAt(new Date(instant))).toBe(day);
        });
    });

    describe('Scenario: the instant of a Paris wall clock', () => {
        it.each([
            [
                '9:00 in winter',
                '2026-11-24',
                NINE_AM,
                '2026-11-24T08:00:00.000Z',
            ],
            [
                '9:00 in summer',
                '2027-07-01',
                NINE_AM,
                '2027-07-01T07:00:00.000Z',
            ],
            [
                '20:59 in winter',
                '2026-11-24',
                20 * 60 + 59,
                '2026-11-24T19:59:00.000Z',
            ],
            [
                'the midnight that ends a winter day',
                '2026-11-24',
                MINUTES_PER_DAY,
                '2026-11-24T23:00:00.000Z',
            ],
            [
                'the midnight that ends the last day of a month',
                '2026-11-30',
                MINUTES_PER_DAY,
                '2026-11-30T23:00:00.000Z',
            ],
        ])('places %s', (_label, day, minute, instant) => {
            expect(coupleInstantOf(day, minute)).toEqual(new Date(instant));
        });
    });

    describe('Scenario: a day that changes hour', () => {
        it.each([
            [
                '9:00 of the spring day, after the change',
                '2027-03-28',
                NINE_AM,
                '2027-03-28T07:00:00.000Z',
            ],
            [
                'the midnight that ends the 23-hour spring day',
                '2027-03-28',
                MINUTES_PER_DAY,
                '2027-03-28T22:00:00.000Z',
            ],
            [
                '9:00 of the autumn day, after the change',
                '2026-10-25',
                NINE_AM,
                '2026-10-25T08:00:00.000Z',
            ],
            [
                'the midnight that ends the 25-hour autumn day',
                '2026-10-25',
                MINUTES_PER_DAY,
                '2026-10-25T23:00:00.000Z',
            ],
            [
                'the midnight that starts the autumn day',
                '2026-10-25',
                0,
                '2026-10-24T22:00:00.000Z',
            ],
        ])('places %s', (_label, day, minute, instant) => {
            expect(coupleInstantOf(day, minute)).toEqual(new Date(instant));
        });
    });
});
